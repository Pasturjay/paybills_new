import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

import { PaystackService } from '../services/paystack.service';
import { SecurityService } from '../services/security.service';

const paystackService = new PaystackService();
const securityService = new SecurityService();

// Get Wallet Balance
export const getBalance = async (req: Request, res: Response) => {
    try {
        // @ts-ignore - UserId attached by auth middleware
        const userId = req.user.userId;

        const wallet = await prisma.wallet.findFirst({
            where: { userId, currency: 'NGN' },
        });

        if (!wallet) {
            return res.status(404).json({ error: 'Wallet not found' });
        }

        res.json({ balance: wallet.balance, currency: wallet.currency });
    } catch (error) {
        console.error('Get Balance Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Get User Transactions
export const getUserTransactions = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const transactions = await prisma.transaction.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50 // Limit to last 50 for now
        });
        res.json(transactions);
    } catch (error) {
        console.error('Get Transactions Error:', error);
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
};

// Simulate Funding (In prod, this would be a webhook callback)
export const simulateFund = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user.userId;
        const { amount } = req.body;

        // Check KYC Level
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || user.kycLevel < 1) {
            return res.status(403).json({ error: 'Identity verification required. Please verify your NIN to fund your wallet.' });
        }

        const updatedWallet = await prisma.wallet.updateMany({
            where: { userId, currency: 'NGN' },
            data: {
                balance: { increment: Number(amount) }
            }
        });

        // In a real app, create a Transaction and LedgerEntry here too
        await prisma.transaction.create({
            data: {
                userId,
                walletId: (await prisma.wallet.findFirst({ where: { userId } }))?.id || '',
                amount: Number(amount),
                total: Number(amount),
                type: 'FUNDING',
                status: 'SUCCESS',
                reference: 'FUND_' + Date.now()
            }
        });

        // Send Notification
        const { notificationService } = await import('../services/notification.service');
        await notificationService.createNotification(
            userId,
            'Wallet Funded',
            `Your wallet has been funded with ₦${amount}`,
            'SUCCESS'
        );

        res.json({ message: 'Wallet funded successfully', amount });
    } catch (error) {
        res.status(500).json({ error: 'Funding Error' });
    }
};


export const initiateFunding = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user.userId;
        const { amount } = req.body;

        if (!amount || Number(amount) <= 0) {
            return res.status(400).json({ error: 'Invalid amount' });
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        // callback URL - frontend verification page
        // Use process.env.FRONTEND_URL usually, hardcoding for now based on user context if needed, or relative.
        // Assuming localhost or the deployed URL.
        const callbackUrl = `${process.env.APP_URL || 'http://localhost:3000'}/dashboard/fund/verify`;

        const initResponse = await paystackService.initializeTransaction(user.email, Number(amount), callbackUrl);

        res.json({
            message: 'Authorization URL created',
            authorization_url: initResponse.authorization_url,
            reference: initResponse.reference
        });

    } catch (error: any) {
        console.error('Initiate Funding Error:', error);
        res.status(500).json({ error: error.message || 'Failed to initiate funding' });
    }
};

export const verifyFunding = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user.userId;
        const { reference } = req.query;

        if (!reference || typeof reference !== 'string') {
            return res.status(400).json({ error: 'Transaction reference is required' });
        }

        // 1. Verify with Paystack
        const verification = await paystackService.verifyTransaction(reference);

        if (verification.status !== 'success') {
            return res.status(400).json({ error: 'Transaction was not successful' });
        }

        // 2. Check if transaction already processed
        const existingTx = await prisma.transaction.findFirst({
            where: { reference: reference }
        });

        if (existingTx) {
            return res.json({ message: 'Transaction already processed', status: existingTx.status });
        }

        // 3. Fund Wallet
        const amount = verification.amount / 100; // Convert kobo to naira

        const wallet = await prisma.wallet.findFirst({ where: { userId, currency: 'NGN' } });
        if (!wallet) return res.status(404).json({ error: 'Wallet not found' });

        await prisma.$transaction([
            prisma.wallet.update({
                where: { id: wallet.id },
                data: { balance: { increment: amount } }
            }),
            prisma.transaction.create({
                data: {
                    userId,
                    walletId: wallet.id,
                    amount: amount,
                    total: amount,
                    type: 'FUNDING',
                    status: 'SUCCESS',
                    reference: reference,
                    metadata: JSON.stringify(verification)
                }
            })
        ]);

        // 4. Notify
        const { notificationService } = await import('../services/notification.service');
        await notificationService.createNotification(
            userId,
            'Wallet Funded',
            `Your wallet has been funded with ₦${amount.toLocaleString()}`,
            'SUCCESS'
        );

        res.json({ message: 'Wallet funded successfully', amount });

    } catch (error: any) {
        console.error('Verify Funding Error:', error);
        res.status(500).json({ error: error.message || 'Verification failed' });
    }
};

import { FlutterwaveService } from '../services/flutterwave.service';
const flutterwaveService = new FlutterwaveService();

export const getVirtualAccount = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user.userId;
        const provider = (req.query.provider as string)?.toUpperCase() || 'PAYSTACK'; // Default to Paystack

        // 1. Check if exists in DB for this provider
        const existingAccount = await prisma.virtualAccount.findFirst({
            where: { userId, provider }
        });

        if (existingAccount) {
            return res.json(existingAccount);
        }

        // 2. Fetch User details for creation
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Basic validation for creation
        if (!user.firstName || !user.lastName || !user.phone) {
            return res.status(400).json({ error: 'Please update your profile name and phone number to generate an account.' });
        }

        let newAccountData;

        if (provider === 'FLUTTERWAVE') {
            // Flutterwave requires BVN usually. Check checks.
            if (!user.bvn) {
                return res.status(400).json({ error: 'BVN is required to generate a Flutterwave Virtual Account. Please complete KYC.' });
            }

            const txRef = `VA-${userId}-${Date.now()}`;
            const flwAccount = await flutterwaveService.createVirtualAccount(
                user.email,
                user.bvn,
                txRef,
                user.firstName,
                user.lastName,
                user.phone
            );

            newAccountData = {
                userId,
                bankName: flwAccount.bank_name,
                accountNumber: flwAccount.account_number,
                accountName: `${user.firstName} ${user.lastName}`, // Sometimes flw doesn't return name in data, strictly
                currency: 'NGN',
                provider: 'FLUTTERWAVE',
                providerRef: flwAccount.order_ref
            };

        } else {
            // PAYSTACK Logic
            const paystackAccount = await paystackService.createDedicatedAccount(
                user.email,
                user.firstName,
                user.lastName,
                user.phone
            );

            // Adjusting based on standard Paystack DVA response which might be nested
            // Typically: { bank: { name, ... }, account_number, account_name, ... }
            newAccountData = {
                userId,
                bankName: paystackAccount.bank.name,
                accountNumber: paystackAccount.account_number,
                accountName: paystackAccount.account_name,
                currency: paystackAccount.currency || 'NGN',
                provider: 'PAYSTACK',
                providerRef: String(paystackAccount.id)
            };
        }

        // 4. Save to DB
        const newAccount = await prisma.virtualAccount.create({
            data: newAccountData
        });

        res.json(newAccount);

    } catch (error: any) {
        console.error('Get Virtual Account Error:', error);
        res.status(500).json({ error: error.message || 'Failed to retrieve virtual account' });
    }
};

export const transferFunds = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user.userId;
        const { recipientEmail, recipientPhone, amount, pin, description } = req.body;

        if (!amount || Number(amount) <= 0) {
            return res.status(400).json({ error: 'Invalid amount' });
        }

        // 1. Verify PIN
        await securityService.validateRequestPin(userId, pin);

        // 2. Find Recipient
        let recipient;
        if (recipientEmail) {
            recipient = await prisma.user.findUnique({ where: { email: recipientEmail } });
        } else if (recipientPhone) {
            recipient = await prisma.user.findUnique({ where: { phone: recipientPhone } });
        } else if (req.body.recipientTag) {
            let tag = req.body.recipientTag;
            if (!tag.startsWith('@')) tag = '@' + tag; // Normalize tag
            recipient = await prisma.user.findUnique({ where: { userTag: tag } });
        }

        if (!recipient) {
            return res.status(404).json({ error: 'Recipient not found' });
        }

        if (recipient.id === userId) {
            return res.status(400).json({ error: 'Cannot transfer to yourself' });
        }

        // 3. Perform Atomic Transfer
        await prisma.$transaction(async (tx) => {
            // Check Sender Balance (Locking row if needed, but atomic increment/decrement is usually safe enough for this scale)
            // Ideally we check balance first
            const senderWallet = await tx.wallet.findFirst({ where: { userId, currency: 'NGN' } });
            if (!senderWallet || senderWallet.balance.toNumber() < Number(amount)) {
                throw new Error('Insufficient funds');
            }

            // Deduct from Sender
            await tx.wallet.update({
                where: { id: senderWallet.id },
                data: { balance: { decrement: Number(amount) } }
            });

            // Add to Recipient
            const recipientWallet = await tx.wallet.findFirst({ where: { userId: recipient.id, currency: 'NGN' } });
            if (!recipientWallet) {
                // Should exist, but handle edge case
                throw new Error('Recipient wallet not found'); // Or create one
            }
            await tx.wallet.update({
                where: { id: recipientWallet.id },
                data: { balance: { increment: Number(amount) } }
            });

            // Create Transaction Records
            const ref = 'TRF_' + Date.now() + Math.floor(Math.random() * 1000);

            // Sender Transaction
            await tx.transaction.create({
                data: {
                    userId,
                    walletId: senderWallet.id,
                    amount: Number(amount),
                    total: Number(amount),
                    type: 'P2P_TRANSFER',
                    status: 'SUCCESS',
                    reference: ref + '_DR',
                    metadata: JSON.stringify({ recipientId: recipient.id, recipientName: `${recipient.firstName} ${recipient.lastName}` }),
                    description: description || 'Transfer to ' + recipient.firstName
                } as any // Using as any to bypass partial type mismatches if schema not fully synced in IDE
            });

            // Recipient Transaction
            await tx.transaction.create({
                data: {
                    userId: recipient.id,
                    walletId: recipientWallet.id,
                    amount: Number(amount),
                    total: Number(amount),
                    type: 'P2P_TRANSFER',
                    status: 'SUCCESS',
                    reference: ref + '_CR',
                    metadata: JSON.stringify({ senderId: userId }),
                    description: description || 'Transfer from ' + (await tx.user.findUnique({ where: { id: userId } }))?.firstName
                } as any
            });
        });

        // 4. Notify
        const { notificationService } = await import('../services/notification.service');
        await notificationService.createNotification(userId, 'Transfer Successful', `You sent ₦${amount} to ${recipient.firstName}`, 'SUCCESS');
        await notificationService.createNotification(recipient.id, 'Money Received', `You received ₦${amount}`, 'SUCCESS');

        res.json({ message: 'Transfer successful' });

    } catch (error: any) {
        console.error('Transfer Error:', error);
        res.status(400).json({ error: error.message || 'Transfer failed' });
    }
};

export const lookupUser = async (req: Request, res: Response) => {
    try {
        const { query } = req.body;
        if (!query) {
            return res.status(400).json({ error: 'Query is required' });
        }

        let searchCriteria: any = {};

        if (query.startsWith('@')) {
            searchCriteria.userTag = query;
        } else if (query.includes('@')) {
            searchCriteria.email = query;
        } else {
            searchCriteria.phone = query;
        }

        const user = await prisma.user.findFirst({
            where: searchCriteria,
            select: {
                id: true,
                firstName: true,
                lastName: true,
                userTag: true,
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User',
            userTag: user.userTag
        });

    } catch (error: any) {
        console.error('Lookup Error:', error);
        res.status(500).json({ error: 'Lookup failed' });
    }
};
