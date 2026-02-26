import prisma from '../prisma';
import { providerService } from './provider.service';
import { Decimal } from '@prisma/client/runtime/library';

export class TransactionService {

    async getBalance(userId: string) {
        const wallet = await prisma.wallet.findFirst({ where: { userId, currency: 'NGN' } });
        return wallet ? wallet.balance : 0;
    }

    async initiatePurchase(
        userId: string,
        serviceType: import('@prisma/client').TransactionType,
        amount: number,
        details: any
    ) {
        if (amount <= 0) throw new Error('Invalid amount');

        return prisma.$transaction(async (tx: any) => {
            const wallet = await tx.wallet.findFirst({
                where: { userId, currency: 'NGN' }
            });

            if (!wallet) throw new Error('Wallet not found');
            if (Number(wallet.balance) < amount) throw new Error('Insufficient funds');

            const reference = `PB-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            const transaction = await tx.transaction.create({
                data: {
                    reference,
                    type: serviceType as any,
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
                    balanceAfter: new Decimal(Number(wallet.balance) - amount)
                }
            });

            return transaction;
        });
    }

    async processProviderPurchase(transactionId: string) {
        const txn = await prisma.transaction.findUnique({ where: { id: transactionId } });
        if (!txn) return;
        if (txn.status !== 'PENDING') return;

        try {
            const providerCode = txn.type === 'GIFTCARD' ? 'RELOADLY' : 'DEFAULT';
            const provider = providerService.getProvider(providerCode);
            let response;
            const details: any = txn.metadata;

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
            } else {
                await this.failTransaction(txn.id, response.message || 'Provider Failed');
            }

            return response;

        } catch (e: any) {
            console.error(`Transaction Failed: ${e.message}`);
            await this.failTransaction(txn.id, e.message);
            return { success: false, message: e.message };
        }
    }

    async completeTransaction(id: string, status: 'SUCCESS', providerResponse: any) {
        await prisma.transaction.update({
            where: { id },
            data: {
                status,
                externalRef: providerResponse.reference,
                metadata: { ...(await prisma.transaction.findUnique({ where: { id } }))?.metadata as object, providerResponse }
            }
        });

        // Send Notification
        const txn = await prisma.transaction.findUnique({ where: { id } });
        if (txn) {
            const { notificationService } = await import('../services/notification.service');
            await notificationService.createNotification(
                txn.userId,
                'Transaction Successful',
                `Your ${txn.type} purchase of ₦${txn.amount} was successful.`,
                'SUCCESS'
            );
        }
    }

    async failTransaction(id: string, reason: string) {
        return prisma.$transaction(async (tx) => {
            const txn = await tx.transaction.findUnique({ where: { id } });
            if (!txn || txn.status !== 'PENDING') return;

            await tx.transaction.update({
                where: { id },
                data: { status: 'FAILED', metadata: { ...(txn.metadata as object), failureReason: reason } }
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
                    balanceAfter: wallet!.balance
                }
            });
        });
    }
}

export const transactionService = new TransactionService();
