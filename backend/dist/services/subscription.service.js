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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionService = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class SubscriptionService {
    // Start the Daily Job (Runs at midnight)
    startCron() {
        node_cron_1.default.schedule('0 0 * * *', () => __awaiter(this, void 0, void 0, function* () {
            console.log('Running Daily Subscription Check...');
            yield this.processRenewals();
        }));
    }
    processRenewals() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const today = new Date();
                // Find Active Subscriptions due today or in the past
                // @ts-ignore
                const dueSubscriptions = yield prisma.subscription.findMany({
                    where: {
                        status: 'ACTIVE',
                        nextBillingDate: { lte: today },
                        autoRenew: true
                    },
                    include: { virtualNumber: true }
                });
                console.log(`Found ${dueSubscriptions.length} due subscriptions.`);
                for (const sub of dueSubscriptions) {
                    yield this.attemptRenewal(sub);
                }
            }
            catch (error) {
                console.error('Subscription Job Error:', error);
            }
        });
    }
    attemptRenewal(sub) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const cost = Number(((_a = sub.virtualNumber) === null || _a === void 0 ? void 0 : _a.userMonthlyPrice) || 5000);
                yield prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                    var _a;
                    // 1. Check Wallet
                    const wallet = yield tx.wallet.findFirst({ where: { userId: sub.userId, currency: 'NGN' } });
                    if (!wallet || wallet.balance.toNumber() < cost) {
                        throw new Error('Insufficient funds');
                    }
                    // 2. Charge
                    yield tx.wallet.update({
                        where: { id: wallet.id },
                        data: { balance: { decrement: cost } }
                    });
                    // 3. Log Transaction
                    yield tx.transaction.create({
                        data: {
                            userId: sub.userId,
                            walletId: wallet.id,
                            amount: cost,
                            total: cost,
                            type: 'VIRTUAL_NUMBER_RENEW', // Ensure this enum exists or use mapped string
                            status: 'SUCCESS',
                            reference: `SUB_${sub.id}_${Date.now()}`,
                            description: `Renewal for ${(_a = sub.virtualNumber) === null || _a === void 0 ? void 0 : _a.phoneNumber}`,
                        }
                    });
                    // 4. Update Subscription
                    const nextDate = new Date(sub.nextBillingDate);
                    nextDate.setDate(nextDate.getDate() + 30);
                    // @ts-ignore
                    yield tx.subscription.update({
                        where: { id: sub.id },
                        data: { nextBillingDate: nextDate, status: 'ACTIVE' }
                    });
                }));
                console.log(`Renewed Subscription ${sub.id}`);
            }
            catch (error) {
                console.error(`Failed to renew subscription ${sub.id}:`, error);
                // Mark as PENDING/FAILED
                // @ts-ignore
                yield prisma.subscription.update({
                    where: { id: sub.id },
                    data: { status: 'PAYMENT_FAILED' }
                });
                // Notify User (TODO)
            }
        });
    }
}
exports.SubscriptionService = SubscriptionService;
