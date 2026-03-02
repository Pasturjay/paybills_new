"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingService = void 0;
const client_1 = require("@prisma/client");
const clubkonnect_provider_1 = require("../providers/clubkonnect.provider");
const uuid_1 = require("uuid");
const prisma = new client_1.PrismaClient();
class BillingService {
    constructor() {
        this.provider = new clubkonnect_provider_1.ClubKonnectProvider();
    }
    /**
     * Core ACID Transaction Wrapper
     */
    async purchaseUtility(userId, amount, type, purchaseLogic) {
        // 1. Generate References
        const reference = (0, uuid_1.v4)();
        const idempotencyKey = (0, uuid_1.v4)(); // INTERNAL IDEMPOTENCY
        // 2. Start Database Transaction
        return await prisma.$transaction(async (tx) => {
            // A. Fetch & Lock Wallet using SELECT FOR UPDATE
            // This prevents concurrent transactions from reading the same balance
            const walletResults = await tx.$queryRaw(client_1.Prisma.sql `SELECT * FROM "Wallet" WHERE "userId" = ${userId} AND "currency" = 'NGN' FOR UPDATE`);
            const wallet = walletResults[0];
            if (!wallet)
                throw new Error('Wallet not found');
            // Handle Decimal type from raw query
            const balance = typeof wallet.balance === 'number' ? wallet.balance : Number(wallet.balance);
            if (balance < amount)
                throw new Error('Insufficient balance');
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
                    status: client_1.TransactionStatus.PENDING,
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
            }
            catch (networkError) {
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
                const finalStatus = providerResponse.status === 'SUCCESS' ? client_1.TransactionStatus.SUCCESS : client_1.TransactionStatus.PENDING;
                await tx.transaction.update({
                    where: { id: transaction.id },
                    data: {
                        status: finalStatus,
                        externalRef: providerResponse.providerReference,
                        metadata: providerResponse.rawResponse
                    }
                });
                return { status: finalStatus, message: 'Purchase successful', data: providerResponse };
            }
            else if (providerResponse.status === 'PENDING') {
                return { status: 'PENDING', message: 'Transaction pending provider confirmation', reference };
            }
            else {
                // F. Failure -> Auto-Refund (Rollback occurs because we throw)
                throw new Error(providerResponse.message || 'Provider failed transaction');
            }
        });
    }
    async purchaseAirtime(userId, networkId, phoneNumber, amount) {
        try {
            return await this.purchaseUtility(userId, amount, client_1.TransactionType.AIRTIME, async (provider, ref) => {
                return await provider.purchaseAirtime(networkId, phoneNumber, amount, ref);
            });
        }
        catch (error) {
            console.error('Airtime Purchase Failed:', error.message);
            return { status: 'FAILED', message: error.message };
        }
    }
    async purchaseData(userId, networkId, planId, phoneNumber, amount) {
        try {
            return await this.purchaseUtility(userId, amount, client_1.TransactionType.DATA, async (provider, ref) => {
                return await provider.purchaseData(networkId, planId, phoneNumber, ref);
            });
        }
        catch (error) {
            console.error('Data Purchase Failed:', error.message);
            return { status: 'FAILED', message: error.message };
        }
    }
    async purchaseCable(userId, providerId, packageId, smartcardNumber, amount) {
        try {
            return await this.purchaseUtility(userId, amount, client_1.TransactionType.CABLE, async (provider, ref) => {
                return await provider.purchaseCable(providerId, packageId, smartcardNumber, ref);
            });
        }
        catch (error) {
            console.error('Cable Purchase Failed:', error.message);
            return { status: 'FAILED', message: error.message };
        }
    }
    async purchaseElectricity(userId, providerId, meterNumber, amount) {
        try {
            return await this.purchaseUtility(userId, amount, client_1.TransactionType.ELECTRICITY, async (provider, ref) => {
                return await provider.purchaseElectricity(providerId, meterNumber, amount, ref);
            });
        }
        catch (error) {
            console.error('Electricity Purchase Failed:', error.message);
            return { status: 'FAILED', message: error.message };
        }
    }
    async fundBettingWallet(userId, customerId, amount, providerCode) {
        try {
            return await this.purchaseUtility(userId, amount, client_1.TransactionType.BETTING, async (provider, ref) => {
                if (provider.fundBettingWallet) {
                    return await provider.fundBettingWallet(customerId, amount, providerCode, ref);
                }
                throw new Error('Provider does not support Betting');
            });
        }
        catch (error) {
            console.error('Betting Funding Failed:', error.message);
            return { status: 'FAILED', message: error.message };
        }
    }
    async purchaseEducationPIN(userId, type, quantity, amount) {
        try {
            return await this.purchaseUtility(userId, amount, client_1.TransactionType.EDUCATION, async (provider, ref) => {
                if (provider.purchaseEducationPIN) {
                    return await provider.purchaseEducationPIN(type, quantity, ref);
                }
                throw new Error('Provider does not support Education PINs');
            });
        }
        catch (error) {
            console.error('Education PIN Purchase Failed:', error.message);
            return { status: 'FAILED', message: error.message };
        }
    }
    async printRechargeCard(userId, networkId, amount, quantity) {
        try {
            const totalAmount = amount * quantity;
            return await this.purchaseUtility(userId, totalAmount, client_1.TransactionType.EPIN, async (provider, ref) => {
                if (provider.printRechargeCard) {
                    return await provider.printRechargeCard(networkId, amount, quantity, ref);
                }
                throw new Error('Provider does not support Recharge Card Printing');
            });
        }
        catch (error) {
            console.error('Recharge Card Printing Failed:', error.message);
            return { status: 'FAILED', message: error.message };
        }
    }
}
exports.BillingService = BillingService;
