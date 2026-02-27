
import { Request, Response } from 'express';
import crypto from 'crypto';
import prisma from '../prisma';
import { transactionService } from '../services/transaction.service';

/**
 * Handle Paystack Webhook
 * Automated callback from Paystack for successful transactions (funding or software)
 */
export const handlePaystackWebhook = async (req: Request, res: Response) => {
    try {
        const secret = process.env.PAYSTACK_SECRET_KEY || '';
        const signature = req.headers['x-paystack-signature'];

        if (!signature || typeof signature !== 'string') {
            console.warn('Paystack Webhook: Missing signature');
            return res.status(401).send('No signature');
        }

        // 1. Verify Signature
        const hash = crypto.createHmac('sha256', secret).update(JSON.stringify(req.body)).digest('hex');
        if (hash !== signature) {
            console.warn('Paystack Webhook: Signature mismatch');
            return res.status(401).send('Invalid signature');
        }

        const event = req.body;
        console.log('Paystack Webhook Event:', event.event);

        if (event.event === 'charge.success') {
            const data = event.data;
            const reference = data.reference;
            const amount = data.amount / 100; // kobo to naira
            const metadata = data.metadata || {};
            const email = data.customer.email;

            // Check if already processed
            const existingTx = await prisma.transaction.findFirst({
                where: { reference: reference }
            });

            if (existingTx && existingTx.status === 'SUCCESS') {
                console.log(`Paystack Webhook: Transaction ${reference} already processed.`);
                return res.status(200).send('Already processed');
            }

            // Find User
            const user = await prisma.user.findUnique({
                where: { email }
            });

            if (!user) {
                console.error(`Paystack Webhook: User with email ${email} not found.`);
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
                            where: { reference: reference },
                            update: { status: 'SUCCESS', metadata: JSON.stringify(data) },
                            create: {
                                userId: user.id,
                                walletId: wallet.id,
                                amount: amount,
                                total: amount,
                                type: 'FUNDING',
                                status: 'SUCCESS',
                                reference: reference,
                                metadata: JSON.stringify(data),
                                description: 'Wallet Funding via Paystack (Webhook)'
                            }
                        })
                    ]);
                    console.log(`Paystack Webhook: Wallet funded for ${email} (₦${amount})`);
                }
            } else if (metadata.type === 'software') {
                // Software Purchase
                // Find the pending transaction created during initialization
                const tx = await prisma.transaction.findFirst({
                    where: {
                        userId: user.id,
                        status: 'PENDING',
                        type: 'EPIN',
                        total: amount // Basic match if reference isn't stored in metadata of pending tx yet
                    },
                    orderBy: { createdAt: 'desc' }
                });

                if (tx) {
                    // Deliver items
                    const items = (tx.metadata as any)?.items || [];
                    const processedItems = items.map((item: any) => ({
                        ...item,
                        licenseKey: `PAYSTACK-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`
                    }));

                    await transactionService.completeTransaction(tx.id, 'SUCCESS', {
                        reference: reference,
                        message: 'Software Delivered via Paystack Webhook',
                        processedItems
                    });
                    console.log(`Paystack Webhook: Software delivered to ${email}`);
                } else {
                    console.error(`Paystack Webhook: Pending software transaction not found for ${email}`);
                }
            } else {
                // Default fallback: treat as legacy funding if no type
                console.warn('Paystack Webhook: Unknown metadata type, defaulting to funding check.');
                // ... same as funding logic or log it
            }
        }

        res.status(200).send('OK');
    } catch (error: any) {
        console.error('Paystack Webhook Error:', error.message);
        res.status(500).send('Internal Server Error');
    }
};
