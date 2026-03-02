"use strict";
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
        node_cron_1.default.schedule('0 0 * * *', async () => {
            console.log('Running Daily Subscription Check...');
            await this.processRenewals();
        });
    }
    async processRenewals() {
        try {
            const today = new Date();
            // Find Active Subscriptions due today or in the past
            // @ts-ignore
            const dueSubscriptions = await prisma.subscription.findMany({
                where: {
                    status: 'ACTIVE',
                    nextBillingDate: { lte: today },
                    autoRenew: true
                },
                include: { virtualNumber: true }
            });
            console.log(`Found ${dueSubscriptions.length} due subscriptions.`);
            for (const sub of dueSubscriptions) {
                await this.attemptRenewal(sub);
            }
        }
        catch (error) {
            console.error('Subscription Job Error:', error);
        }
    }
    async attemptRenewal(sub) {
        var _a;
        try {
            const cost = Number(((_a = sub.virtualNumber) === null || _a === void 0 ? void 0 : _a.userMonthlyPrice) || 5000);
            await prisma.$transaction(async (tx) => {
                var _a;
                // 1. Check Wallet
                const wallet = await tx.wallet.findFirst({ where: { userId: sub.userId, currency: 'NGN' } });
                if (!wallet || wallet.balance.toNumber() < cost) {
                    throw new Error('Insufficient funds');
                }
                // 2. Charge
                await tx.wallet.update({
                    where: { id: wallet.id },
                    data: { balance: { decrement: cost } }
                });
                // 3. Log Transaction
                await tx.transaction.create({
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
                await tx.subscription.update({
                    where: { id: sub.id },
                    data: { nextBillingDate: nextDate, status: 'ACTIVE' }
                });
            });
            console.log(`Renewed Subscription ${sub.id}`);
        }
        catch (error) {
            console.error(`Failed to renew subscription ${sub.id}:`, error);
            // Mark as PENDING/FAILED
            // @ts-ignore
            await prisma.subscription.update({
                where: { id: sub.id },
                data: { status: 'PAYMENT_FAILED' }
            });
            // Notify User (TODO)
        }
    }
}
exports.SubscriptionService = SubscriptionService;
