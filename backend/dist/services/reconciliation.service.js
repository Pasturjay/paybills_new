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
exports.ReconciliationService = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const client_1 = require("@prisma/client");
const clubkonnect_provider_1 = require("../providers/clubkonnect.provider");
const prisma = new client_1.PrismaClient();
const provider = new clubkonnect_provider_1.ClubKonnectProvider();
class ReconciliationService {
    constructor() {
        // Schedule job to run every 5 minutes
        node_cron_1.default.schedule('*/5 * * * *', () => {
            console.log('Running Reconciliation Job...');
            this.reconcilePendingTransactions();
        });
    }
    reconcilePendingTransactions() {
        return __awaiter(this, void 0, void 0, function* () {
            // 1. Fetch PENDING transactions older than 5 minutes
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
            const pendingTransactions = yield prisma.transaction.findMany({
                where: {
                    status: client_1.TransactionStatus.PENDING,
                    createdAt: { lt: fiveMinutesAgo }
                },
                take: 50 // Process in batches
            });
            if (pendingTransactions.length === 0)
                return;
            let processed = 0;
            let resolved = 0;
            let failed = 0;
            for (const tx of pendingTransactions) {
                processed++;
                try {
                    // 2. Query Provider
                    // We use idempotencyKey or reference depending on what we sent. 
                    // BillingService sent `reference`.
                    const response = yield provider.queryTransactionStatus(tx.reference);
                    if (response.status === 'SUCCESS') {
                        // Update to Success
                        yield prisma.transaction.update({
                            where: { id: tx.id },
                            data: {
                                status: client_1.TransactionStatus.SUCCESS,
                                externalRef: response.providerReference,
                                updatedAt: new Date()
                            }
                        });
                        resolved++;
                    }
                    else if (response.status === 'FAILED') {
                        // Reverse Transaction & Refund
                        yield prisma.$transaction((prismaTx) => __awaiter(this, void 0, void 0, function* () {
                            yield prismaTx.transaction.update({
                                where: { id: tx.id },
                                data: { status: client_1.TransactionStatus.REVERSED, updatedAt: new Date() }
                            });
                            yield prismaTx.wallet.update({
                                where: { id: tx.walletId },
                                data: { balance: { increment: tx.amount } }
                            });
                        }));
                        resolved++;
                    }
                    else {
                        // Still Pending
                        failed++;
                    }
                }
                catch (error) {
                    console.error(`Reconciliation Error for TX ${tx.reference}:`, error);
                    failed++;
                }
            }
            // 3. Log Result
            yield prisma.reconciliationLog.create({
                data: {
                    status: failed === 0 ? 'SUCCESS' : 'PARTIAL',
                    processedCount: processed,
                    resolvedCount: resolved,
                    failedCount: failed,
                    details: { processedIds: pendingTransactions.map(t => t.id) }
                }
            });
        });
    }
}
exports.ReconciliationService = ReconciliationService;
