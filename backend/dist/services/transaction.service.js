"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactionService = exports.TransactionService = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const provider_service_1 = require("./provider.service");
const library_1 = require("@prisma/client/runtime/library");
class TransactionService {
    async getBalance(userId) {
        const wallet = await prisma_1.default.wallet.findFirst({ where: { userId, currency: 'NGN' } });
        return wallet ? wallet.balance : 0;
    }
    async initiatePurchase(userId, serviceType, amount, details) {
        if (amount <= 0)
            throw new Error('Invalid amount');
        return prisma_1.default.$transaction(async (tx) => {
            const wallet = await tx.wallet.findFirst({
                where: { userId, currency: 'NGN' }
            });
            if (!wallet)
                throw new Error('Wallet not found');
            if (Number(wallet.balance) < amount)
                throw new Error('Insufficient funds');
            const reference = `PB-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            const transaction = await tx.transaction.create({
                data: {
                    reference,
                    type: serviceType,
                    status: 'PENDING',
                    amount: amount,
                    total: amount,
                    userId,
                    walletId: wallet.id,
                    metadata: details
                }
            });
            await tx.wallet.update({
                where: { id: wallet.id },
                data: { balance: { decrement: amount } }
            });
            await tx.ledgerEntry.create({
                data: {
                    transactionId: transaction.id,
                    accountType: 'USER_WALLET',
                    description: `Purchase ${serviceType}`,
                    debit: amount,
                    balanceAfter: new library_1.Decimal(Number(wallet.balance) - amount)
                }
            });
            return transaction;
        });
    }
    async processProviderPurchase(transactionId) {
        const txn = await prisma_1.default.transaction.findUnique({ where: { id: transactionId } });
        if (!txn)
            return;
        if (txn.status !== 'PENDING')
            return;
        try {
            const providerCode = txn.type === 'GIFTCARD' ? 'RELOADLY' : 'DEFAULT';
            const provider = provider_service_1.providerService.getProvider(providerCode);
            let response;
            const details = txn.metadata;
            switch (txn.type) {
                case 'AIRTIME':
                    response = await provider.purchaseAirtime(details.network, details.phone, Number(txn.amount), txn.reference);
                    break;
                case 'DATA':
                    response = await provider.purchaseData(details.network, details.phone, details.plan, txn.reference);
                    break;
                case 'ELECTRICITY':
                    response = await provider.purchaseElectricity(details.disco, details.meterNumber, Number(txn.amount), txn.reference);
                    break;
                case 'CABLE':
                    response = await provider.purchaseCable(details.provider, details.iuc, details.plan, txn.reference);
                    break;
                case 'GIFTCARD':
                    response = await provider.purchaseGiftCard(details.brandId, Number(txn.amount), details.quantity || 1, txn.reference);
                    break;
                case 'GAME_TOPUP':
                    response = await provider.purchaseGameTopup(details.gameId, details.playerId, details.packageId, txn.reference);
                    break;
                case 'EDUCATION':
                    response = await provider.purchaseEducationPin(details.examType, details.quantity || 1, txn.reference);
                    break;
                case 'BETTING':
                    response = await provider.purchaseBettingWallet(details.customerId, Number(txn.amount), details.providerCode, txn.reference);
                    break;
                case 'EPIN':
                    response = await provider.printRechargeCard(details.network, Number(txn.amount), details.quantity || 1, txn.reference);
                    break;
                default:
                    throw new Error('Unsupported Transaction Type');
            }
            if (response.success) {
                await this.completeTransaction(txn.id, 'SUCCESS', response);
            }
            else {
                await this.failTransaction(txn.id, response.message || 'Provider Failed');
            }
            return response;
        }
        catch (e) {
            console.error(`Transaction Failed: ${e.message}`);
            await this.failTransaction(txn.id, e.message);
            return { success: false, message: e.message };
        }
    }
    async completeTransaction(id, status, providerResponse) {
        var _a;
        await prisma_1.default.transaction.update({
            where: { id },
            data: {
                status,
                externalRef: providerResponse.reference,
                metadata: { ...(_a = (await prisma_1.default.transaction.findUnique({ where: { id } }))) === null || _a === void 0 ? void 0 : _a.metadata, providerResponse }
            }
        });
        // Send Notification
        const txn = await prisma_1.default.transaction.findUnique({ where: { id } });
        if (txn) {
            const { notificationService } = await Promise.resolve().then(() => __importStar(require('../services/notification.service')));
            await notificationService.createNotification(txn.userId, 'Transaction Successful', `Your ${txn.type} purchase of ₦${txn.amount} was successful.`, 'SUCCESS');
        }
    }
    async failTransaction(id, reason) {
        return prisma_1.default.$transaction(async (tx) => {
            const txn = await tx.transaction.findUnique({ where: { id } });
            if (!txn || txn.status !== 'PENDING')
                return;
            await tx.transaction.update({
                where: { id },
                data: { status: 'FAILED', metadata: { ...txn.metadata, failureReason: reason } }
            });
            await tx.wallet.update({
                where: { id: txn.walletId },
                data: { balance: { increment: txn.amount } }
            });
            const wallet = await tx.wallet.findUnique({ where: { id: txn.walletId } });
            await tx.ledgerEntry.create({
                data: {
                    transactionId: txn.id,
                    accountType: 'USER_WALLET',
                    description: `Refund: ${reason}`,
                    credit: txn.amount,
                    balanceAfter: wallet.balance
                }
            });
        });
    }
}
exports.TransactionService = TransactionService;
exports.transactionService = new TransactionService();
