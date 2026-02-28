import { PrismaClient, TransactionType, TransactionStatus, Wallet, Prisma } from '@prisma/client';
import { ClubKonnectProvider } from '../providers/clubkonnect.provider';
import { BillProvider } from '../providers/interfaces/bill-provider.interface';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export class BillingService {
    private provider: BillProvider;

    constructor() {
        this.provider = new ClubKonnectProvider();
    }

    /**
     * Core ACID Transaction Wrapper
     */
    async purchaseUtility(
        userId: string,
        amount: number,
        type: TransactionType,
        purchaseLogic: (provider: BillProvider, requestId: string) => Promise<any>
    ) {
        // 1. Generate References
        const reference = uuidv4();
        const idempotencyKey = uuidv4(); // INTERNAL IDEMPOTENCY

        // 2. Start Database Transaction
        return await prisma.$transaction(async (tx) => {
            // A. Fetch & Lock Wallet using SELECT FOR UPDATE
            // This prevents concurrent transactions from reading the same balance
            const walletResults = await tx.$queryRaw<Wallet[]>(
                Prisma.sql`SELECT * FROM "Wallet" WHERE "userId" = ${userId} AND "currency" = 'NGN' FOR UPDATE`
            );
            const wallet = walletResults[0];

            if (!wallet) throw new Error('Wallet not found');

            // Handle Decimal type from raw query
            const balance = typeof wallet.balance === 'number' ? wallet.balance : Number(wallet.balance);
            if (balance < amount) throw new Error('Insufficient balance');

            // B. Debit Wallet (Atomic Decrement)
            const updatedWallet = await tx.wallet.update({
                where: { id: wallet.id },
                data: { balance: { decrement: amount } }
            });

            // Double check (redundant with SELECT FOR UPDATE but good for safety)
            if (updatedWallet.balance.toNumber() < 0) {
                throw new Error('Insufficient balance (Race Condition)');
            }

            // C. Create Transaction Record (PENDING)
            const transaction = await tx.transaction.create({
                data: {
                    reference,
                    idempotencyKey,
                    type,
                    status: TransactionStatus.PENDING,
                    amount,
                    total: amount,
                    userId,
                    walletId: wallet.id,
                }
            });

            // D. Call Provider (External API)
            let providerResponse;
            try {
                providerResponse = await purchaseLogic(this.provider, reference);
            } catch (networkError) {
                // If network error, we keep it PENDING
                await tx.transactionAttempt.create({
                    data: {
                        transactionId: transaction.id,
                        attemptNumber: 1,
                        status: 'FAILED',
                        error: 'Network Error during initial call'
                    }
                });
                return { status: 'PENDING', message: 'Transaction processing', reference };
            }

            // E. Handle Provider Response
            if (providerResponse.status === 'SUCCESS' || providerResponse.status === 'ORDER_RECEIVED') {
                const finalStatus = providerResponse.status === 'SUCCESS' ? TransactionStatus.SUCCESS : TransactionStatus.PENDING;

                await tx.transaction.update({
                    where: { id: transaction.id },
                    data: {
                        status: finalStatus,
                        externalRef: providerResponse.providerReference,
                        metadata: providerResponse.rawResponse
                    }
                });

                return { status: finalStatus, message: 'Purchase successful', data: providerResponse };
            } else if (providerResponse.status === 'PENDING') {
                return { status: 'PENDING', message: 'Transaction pending provider confirmation', reference };
            } else {
                // F. Failure -> Auto-Refund (Rollback occurs because we throw)
                throw new Error(providerResponse.message || 'Provider failed transaction');
            }
        });
    }

    async purchaseAirtime(userId: string, networkId: string, phoneNumber: string, amount: number) {
        try {
            return await this.purchaseUtility(userId, amount, TransactionType.AIRTIME, async (provider, ref) => {
                return await provider.purchaseAirtime(networkId, phoneNumber, amount, ref);
            });
        } catch (error: any) {
            console.error('Airtime Purchase Failed:', error.message);
            return { status: 'FAILED', message: error.message };
        }
    }

    async purchaseData(userId: string, networkId: string, planId: string, phoneNumber: string, amount: number) {
        try {
            return await this.purchaseUtility(userId, amount, TransactionType.DATA, async (provider, ref) => {
                return await provider.purchaseData(networkId, planId, phoneNumber, ref);
            });
        } catch (error: any) {
            console.error('Data Purchase Failed:', error.message);
            return { status: 'FAILED', message: error.message };
        }
    }

    async purchaseCable(userId: string, providerId: string, packageId: string, smartcardNumber: string, amount: number) {
        try {
            return await this.purchaseUtility(userId, amount, TransactionType.CABLE, async (provider, ref) => {
                return await provider.purchaseCable(providerId, packageId, smartcardNumber, ref);
            });
        } catch (error: any) {
            console.error('Cable Purchase Failed:', error.message);
            return { status: 'FAILED', message: error.message };
        }
    }

    async purchaseElectricity(userId: string, providerId: string, meterNumber: string, amount: number) {
        try {
            return await this.purchaseUtility(userId, amount, TransactionType.ELECTRICITY, async (provider, ref) => {
                return await provider.purchaseElectricity(providerId, meterNumber, amount, ref);
            });
        } catch (error: any) {
            console.error('Electricity Purchase Failed:', error.message);
            return { status: 'FAILED', message: error.message };
        }
    }

    async fundBettingWallet(userId: string, customerId: string, amount: number, providerCode: string) {
        try {
            return await this.purchaseUtility(userId, amount, TransactionType.BETTING, async (provider, ref) => {
                if (provider.fundBettingWallet) {
                    return await provider.fundBettingWallet(customerId, amount, providerCode, ref);
                }
                throw new Error('Provider does not support Betting');
            });
        } catch (error: any) {
            console.error('Betting Funding Failed:', error.message);
            return { status: 'FAILED', message: error.message };
        }
    }

    async purchaseEducationPIN(userId: string, type: 'WAEC' | 'JAMB', quantity: number, amount: number) {
        try {
            return await this.purchaseUtility(userId, amount, TransactionType.EDUCATION, async (provider, ref) => {
                if (provider.purchaseEducationPIN) {
                    return await provider.purchaseEducationPIN(type, quantity, ref);
                }
                throw new Error('Provider does not support Education PINs');
            });
        } catch (error: any) {
            console.error('Education PIN Purchase Failed:', error.message);
            return { status: 'FAILED', message: error.message };
        }
    }

    async printRechargeCard(userId: string, networkId: string, amount: number, quantity: number) {
        try {
            const totalAmount = amount * quantity;
            return await this.purchaseUtility(userId, totalAmount, TransactionType.EPIN, async (provider, ref) => {
                if (provider.printRechargeCard) {
                    return await provider.printRechargeCard(networkId, amount, quantity, ref);
                }
                throw new Error('Provider does not support Recharge Card Printing');
            });
        } catch (error: any) {
            console.error('Recharge Card Printing Failed:', error.message);
            return { status: 'FAILED', message: error.message };
        }
    }
}
