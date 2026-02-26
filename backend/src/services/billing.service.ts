import { PrismaClient, TransactionType, TransactionStatus, Wallet } from '@prisma/client';
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
            // A. Fetch & Lock Wallet
            // Note: Prisma doesn't support SELECT FOR UPDATE directly in easy API yet without raw query, 
            // but we can rely on atomic update decrement which throws if constraint fails (e.g. check constraint)
            // For now, we fetch validation.
            const wallet = await tx.wallet.findFirst({
                where: { userId, currency: 'NGN' }
            });

            if (!wallet) throw new Error('Wallet not found');
            if (wallet.balance.toNumber() < amount) throw new Error('Insufficient balance');

            // B. Debit Wallet (Atomic Decrement)
            const updatedWallet = await tx.wallet.update({
                where: { id: wallet.id },
                data: { balance: { decrement: amount } }
            });

            // Check constraint again just in case of race condition if db doesn't forbid below zero by default
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
            // CRITICAL: If this times out or network fails, we MUST NOT rollback perfectly yet, 
            // we should mark as PENDING and let reconciliation handle it, OR we rollback if we are sure it failed.
            // For ClubKonnect, "Network Error" -> PENDING/RETRY. "Invalid Number" -> FAILED & REFUND.

            let providerResponse;
            try {
                providerResponse = await purchaseLogic(this.provider, reference);
            } catch (networkError) {
                // If network error, we keep it PENDING and schedule retry (log attempt)
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
                // Confirm Success (or keep PENDING if ORDER_RECEIVED)
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
                // Keep Pending
                return { status: 'PENDING', message: 'Transaction pending provider confirmation', reference };
            } else {
                // F. Failure -> Auto-Refund (Rollback)
                // We typically throw error to trigger Prisma transaction rollback
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
