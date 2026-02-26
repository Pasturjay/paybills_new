"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
    purchaseUtility(userId, amount, type, purchaseLogic) {
        return __awaiter(this, void 0, void 0, function* () {
            // 1. Generate References
            const reference = (0, uuid_1.v4)();
            const idempotencyKey = (0, uuid_1.v4)(); // INTERNAL IDEMPOTENCY
            // 2. Start Database Transaction
            return yield prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                // A. Fetch & Lock Wallet
                // Note: Prisma doesn't support SELECT FOR UPDATE directly in easy API yet without raw query, 
                // but we can rely on atomic update decrement which throws if constraint fails (e.g. check constraint)
                // For now, we fetch validation.
                const wallet = yield tx.wallet.findFirst({
                    where: { userId, currency: 'NGN' }
                });
                if (!wallet)
                    throw new Error('Wallet not found');
                if (wallet.balance.toNumber() < amount)
                    throw new Error('Insufficient balance');
                // B. Debit Wallet (Atomic Decrement)
                const updatedWallet = yield tx.wallet.update({
                    where: { id: wallet.id },
                    data: { balance: { decrement: amount } }
                });
                // Check constraint again just in case of race condition if db doesn't forbid below zero by default
                if (updatedWallet.balance.toNumber() < 0) {
                    throw new Error('Insufficient balance (Race Condition)');
                }
                // C. Create Transaction Record (PENDING)
                const transaction = yield tx.transaction.create({
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
                // CRITICAL: If this times out or network fails, we MUST NOT rollback perfectly yet, 
                // we should mark as PENDING and let reconciliation handle it, OR we rollback if we are sure it failed.
                // For ClubKonnect, "Network Error" -> PENDING/RETRY. "Invalid Number" -> FAILED & REFUND.
                let providerResponse;
                try {
                    providerResponse = yield purchaseLogic(this.provider, reference);
                }
                catch (networkError) {
                    // If network error, we keep it PENDING and schedule retry (log attempt)
                    yield tx.transactionAttempt.create({
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
                    const finalStatus = providerResponse.status === 'SUCCESS' ? client_1.TransactionStatus.SUCCESS : client_1.TransactionStatus.PENDING;
                    yield tx.transaction.update({
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
                    // Keep Pending
                    return { status: 'PENDING', message: 'Transaction pending provider confirmation', reference };
                }
                else {
                    // F. Failure -> Auto-Refund (Rollback)
                    // We typically throw error to trigger Prisma transaction rollback
                    throw new Error(providerResponse.message || 'Provider failed transaction');
                }
            }));
        });
    }
    purchaseAirtime(userId, networkId, phoneNumber, amount) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.purchaseUtility(userId, amount, client_1.TransactionType.AIRTIME, (provider, ref) => __awaiter(this, void 0, void 0, function* () {
                    return yield provider.purchaseAirtime(networkId, phoneNumber, amount, ref);
                }));
            }
            catch (error) {
                console.error('Airtime Purchase Failed:', error.message);
                return { status: 'FAILED', message: error.message };
            }
        });
    }
    purchaseData(userId, networkId, planId, phoneNumber, amount) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.purchaseUtility(userId, amount, client_1.TransactionType.DATA, (provider, ref) => __awaiter(this, void 0, void 0, function* () {
                    return yield provider.purchaseData(networkId, planId, phoneNumber, ref);
                }));
            }
            catch (error) {
                console.error('Data Purchase Failed:', error.message);
                return { status: 'FAILED', message: error.message };
            }
        });
    }
    purchaseCable(userId, providerId, packageId, smartcardNumber, amount) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.purchaseUtility(userId, amount, client_1.TransactionType.CABLE, (provider, ref) => __awaiter(this, void 0, void 0, function* () {
                    return yield provider.purchaseCable(providerId, packageId, smartcardNumber, ref);
                }));
            }
            catch (error) {
                console.error('Cable Purchase Failed:', error.message);
                return { status: 'FAILED', message: error.message };
            }
        });
    }
    purchaseElectricity(userId, providerId, meterNumber, amount) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.purchaseUtility(userId, amount, client_1.TransactionType.ELECTRICITY, (provider, ref) => __awaiter(this, void 0, void 0, function* () {
                    return yield provider.purchaseElectricity(providerId, meterNumber, amount, ref);
                }));
            }
            catch (error) {
                console.error('Electricity Purchase Failed:', error.message);
                return { status: 'FAILED', message: error.message };
            }
        });
    }
    fundBettingWallet(userId, customerId, amount, providerCode) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.purchaseUtility(userId, amount, client_1.TransactionType.BETTING, (provider, ref) => __awaiter(this, void 0, void 0, function* () {
                    if (provider.fundBettingWallet) {
                        return yield provider.fundBettingWallet(customerId, amount, providerCode, ref);
                    }
                    throw new Error('Provider does not support Betting');
                }));
            }
            catch (error) {
                console.error('Betting Funding Failed:', error.message);
                return { status: 'FAILED', message: error.message };
            }
        });
    }
    purchaseEducationPIN(userId, type, quantity, amount) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.purchaseUtility(userId, amount, client_1.TransactionType.EDUCATION, (provider, ref) => __awaiter(this, void 0, void 0, function* () {
                    if (provider.purchaseEducationPIN) {
                        return yield provider.purchaseEducationPIN(type, quantity, ref);
                    }
                    throw new Error('Provider does not support Education PINs');
                }));
            }
            catch (error) {
                console.error('Education PIN Purchase Failed:', error.message);
                return { status: 'FAILED', message: error.message };
            }
        });
    }
    printRechargeCard(userId, networkId, amount, quantity) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const totalAmount = amount * quantity;
                return yield this.purchaseUtility(userId, totalAmount, client_1.TransactionType.EPIN, (provider, ref) => __awaiter(this, void 0, void 0, function* () {
                    if (provider.printRechargeCard) {
                        return yield provider.printRechargeCard(networkId, amount, quantity, ref);
                    }
                    throw new Error('Provider does not support Recharge Card Printing');
                }));
            }
            catch (error) {
                console.error('Recharge Card Printing Failed:', error.message);
                return { status: 'FAILED', message: error.message };
            }
        });
    }
}
exports.BillingService = BillingService;
