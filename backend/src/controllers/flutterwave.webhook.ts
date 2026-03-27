
import { Request, Response } from 'express';
import prisma from '../prisma';
import { FlutterwaveService } from '../services/flutterwave.service';
import { transactionService } from '../services/transaction.service';

const flutterwaveService = new FlutterwaveService();

/**
 * Handle Flutterwave Webhook
 * Automated callback from Flutterwave for successful transactions (funding or software)
 */
export const handleFlutterwaveWebhook = async (req: Request, res: Response) => {
    try {
        // 1. Verify Webhook Signature
        const verifHash = req.headers['verif-hash'] as string;

        if (!verifHash) {
            console.warn('Flutterwave Webhook: Missing verif-hash header');
            return res.status(401).send('No signature');
        }

        if (!flutterwaveService.verifyWebhookSignature(verifHash)) {
            console.warn('Flutterwave Webhook: Signature mismatch');
            return res.status(401).send('Invalid signature');
        }

        const event = req.body;
        console.log('Flutterwave Webhook Event:', event.event);

        if (event.event === 'charge.completed' && event.data?.status === 'successful') {
            const data = event.data;
            const txRef = data.tx_ref;
            const flwRef = data.flw_ref;
            const amount = data.amount;
            const email = data.customer?.email;
            const metadata = data.meta || {};

            // Check if already processed
            const existingTx = await prisma.transaction.findFirst({
                where: { reference: txRef }
            });

            if (existingTx && existingTx.status === 'SUCCESS') {
                console.log(`Flutterwave Webhook: Transaction ${txRef} already processed.`);
                return res.status(200).send('Already processed');
            }

            // Find User
            const user = await prisma.user.findUnique({
                where: { email }
            });

            if (!user) {
                console.error(`Flutterwave Webhook: User with email ${email} not found.`);
                return res.status(404).send('User not found');
            }

            // Handle based on metadata type
            if (metadata.type === 'funding') {
                // Wallet Funding
                const wallet = await prisma.wallet.findFirst({ where: { userId: user.id, currency: 'NGN' } });
                if (wallet) {
                    await prisma.$transaction([
                        prisma.wallet.update({
                            where: { id: wallet.id },
                            data: { balance: { increment: amount } }
                        }),
                        prisma.transaction.upsert({
                            where: { reference: txRef },
                            update: { status: 'SUCCESS', metadata: JSON.stringify(data) },
                            create: {
                                userId: user.id,
                                walletId: wallet.id,
                                amount: amount,
                                total: amount,
                                type: 'FUNDING',
                                status: 'SUCCESS',
                                reference: txRef,
                                metadata: JSON.stringify(data),
                                description: 'Wallet Top Up via Flutterwave (Webhook)'
                            }
                        })
                    ]);
                    console.log(`Flutterwave Webhook: Wallet funded for ${email} (₦${amount})`);
                }
            } else if (metadata.type === 'software') {
                // Software Purchase
                const tx = await prisma.transaction.findFirst({
                    where: {
                        userId: user.id,
                        status: 'PENDING',
                        type: 'EPIN',
                        total: amount
                    },
                    orderBy: { createdAt: 'desc' }
                });

                if (tx) {
                    const items = (tx.metadata as any)?.items || [];
                    const processedItems = items.map((item: any) => ({
                        ...item,
                        licenseKey: `FLW-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`
                    }));

                    await transactionService.completeTransaction(tx.id, 'SUCCESS', {
                        reference: txRef,
                        flwRef: flwRef,
                        message: 'Software Delivered via Flutterwave Webhook',
                        processedItems
                    });
                    console.log(`Flutterwave Webhook: Software delivered to ${email}`);
                } else {
                    console.error(`Flutterwave Webhook: Pending software transaction not found for ${email}`);
                }
            } else {
                // Default fallback: treat as funding (DVA transfer)
                console.log(`Flutterwave Webhook: No metadata type for ${txRef}, defaulting to funding flow.`);
                const wallet = await prisma.wallet.findFirst({ where: { userId: user.id, currency: 'NGN' } });
                if (wallet) {
                    await prisma.$transaction([
                        prisma.wallet.update({
                            where: { id: wallet.id },
                            data: { balance: { increment: amount } }
                        }),
                        prisma.transaction.upsert({
                            where: { reference: txRef },
                            update: { status: 'SUCCESS', metadata: JSON.stringify(data) },
                            create: {
                                userId: user.id,
                                walletId: wallet.id,
                                amount: amount,
                                total: amount,
                                type: 'FUNDING',
                                status: 'SUCCESS',
                                reference: txRef,
                                metadata: JSON.stringify(data),
                                description: 'Wallet Top Up (Flutterwave DVA/Direct Transfer)'
                            }
                        })
                    ]);
                    console.log(`Flutterwave Webhook: Wallet funded via fallback for ${email} (₦${amount})`);
                }
            }
        }

        res.status(200).send('OK');
    } catch (error: any) {
        console.error('Flutterwave Webhook Error:', error.message);
        res.status(500).send('Internal Server Error');
    }
};
