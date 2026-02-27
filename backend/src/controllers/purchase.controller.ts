import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Provides context for a purchase, including balance, KYC limits, and recent beneficiaries.
 * Used to make user info discoverable during product checkout.
 */
export const getPurchaseContext = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { type } = req.query; // e.g., AIRTIME, DATA, ELECTRICITY, CABLE, EDUCATION

        // 1. Get Wallet Balance
        const wallet = await prisma.wallet.findFirst({
            where: { userId, currency: 'NGN' },
            select: { balance: true }
        });

        // 2. Get KYC Status & Limits (Mock limits based on KYC level for now)
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { kycLevel: true, isVerified: true }
        });

        const limits: Record<number, number> = {
            0: 50000,   // Tier 0: 50k daily
            1: 200000,  // Tier 1: 200k daily
            2: 1000000, // Tier 2: 1M daily
            3: 5000000  // Tier 3: 5M daily
        };

        const dailyLimit = limits[user?.kycLevel || 0] || 50000;

        // 3. Get Recent Beneficiaries from transaction history
        // We look for successful transactions of the same type and extract recipient info from metadata
        const recentTransactions = await prisma.transaction.findMany({
            where: {
                userId,
                type: type as any,
                status: 'SUCCESS'
            },
            take: 20,
            orderBy: { createdAt: 'desc' },
            select: { metadata: true, description: true }
        });

        const beneficiaries: any[] = [];
        const seenRecipients = new Set();

        for (const tx of recentTransactions) {
            try {
                const meta = typeof tx.metadata === 'string' ? JSON.parse(tx.metadata) : tx.metadata;
                const recipient = meta?.phoneNumber || meta?.smartcardNumber || meta?.meterNumber || meta?.customerId;

                if (recipient && !seenRecipients.has(recipient)) {
                    beneficiaries.push({
                        recipient,
                        name: meta?.recipientName || null,
                        network: meta?.networkId || meta?.providerId || null,
                        lastUsed: tx.description
                    });
                    seenRecipients.add(recipient);
                }
            } catch (e) {
                // Skip malformed metadata
            }
            if (beneficiaries.length >= 5) break;
        }

        res.json({
            balance: wallet?.balance || 0,
            kycLevel: user?.kycLevel || 0,
            dailyLimit,
            isVerified: user?.isVerified || false,
            beneficiaries
        });

    } catch (error: any) {
        console.error('Purchase Context Error:', error);
        res.status(500).json({ error: 'Failed to fetch purchase context' });
    }
};
