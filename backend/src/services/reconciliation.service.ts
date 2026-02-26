import cron from 'node-cron';
import { PrismaClient, TransactionStatus } from '@prisma/client';
import { ClubKonnectProvider } from '../providers/clubkonnect.provider';

const prisma = new PrismaClient();
const provider = new ClubKonnectProvider();

export class ReconciliationService {
    constructor() {
        // Schedule job to run every 5 minutes
        cron.schedule('*/5 * * * *', () => {
            console.log('Running Reconciliation Job...');
            this.reconcilePendingTransactions();
        });
    }

    async reconcilePendingTransactions() {
        // 1. Fetch PENDING transactions older than 5 minutes
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

        const pendingTransactions = await prisma.transaction.findMany({
            where: {
                status: TransactionStatus.PENDING,
                createdAt: { lt: fiveMinutesAgo }
            },
            take: 50 // Process in batches
        });

        if (pendingTransactions.length === 0) return;

        let processed = 0;
        let resolved = 0;
        let failed = 0;

        for (const tx of pendingTransactions) {
            processed++;
            try {
                // 2. Query Provider
                // We use idempotencyKey or reference depending on what we sent. 
                // BillingService sent `reference`.
                const response = await provider.queryTransactionStatus(tx.reference);

                if (response.status === 'SUCCESS') {
                    // Update to Success
                    await prisma.transaction.update({
                        where: { id: tx.id },
                        data: {
                            status: TransactionStatus.SUCCESS,
                            externalRef: response.providerReference,
                            updatedAt: new Date()
                        }
                    });
                    resolved++;
                } else if (response.status === 'FAILED') {
                    // Reverse Transaction & Refund
                    await prisma.$transaction(async (prismaTx) => {
                        await prismaTx.transaction.update({
                            where: { id: tx.id },
                            data: { status: TransactionStatus.REVERSED, updatedAt: new Date() }
                        });

                        await prismaTx.wallet.update({
                            where: { id: tx.walletId },
                            data: { balance: { increment: tx.amount } }
                        });
                    });
                    resolved++;
                } else {
                    // Still Pending
                    failed++;
                }
            } catch (error) {
                console.error(`Reconciliation Error for TX ${tx.reference}:`, error);
                failed++;
            }
        }

        // 3. Log Result
        await prisma.reconciliationLog.create({
            data: {
                status: failed === 0 ? 'SUCCESS' : 'PARTIAL',
                processedCount: processed,
                resolvedCount: resolved,
                failedCount: failed,
                details: { processedIds: pendingTransactions.map(t => t.id) }
            }
        });
    }
}
