import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { VonageProvider } from '../providers/vonage.provider';
import { SecurityService } from '../services/security.service';
import { CacheService } from '../services/cache.service';

const prisma = new PrismaClient();
const vonageProvider = new VonageProvider();
const securityService = new SecurityService();
const cacheService = new CacheService();

// Helper: Calculate Cost (In production, fetch from MarkupRule or DB)
const NUMBER_MONTHLY_COST = 5000.00; // NGN

// 1. Get Available Numbers
export const getAvailableNumbers = async (req: Request, res: Response) => {
    try {
        const country = (req.query.country as string) || 'NG'; // Default Nigeria
        const cacheKey = `vn_search_${country}`;

        // 1. Check Cache
        const cached = cacheService.get<any[]>(cacheKey);
        if (cached) {
            return res.json(cached);
        }

        const numbers = await vonageProvider.searchNumbers(country);

        // Transform for frontend
        const available = numbers.map(n => ({
            number: n.msisdn,
            cost: NUMBER_MONTHLY_COST, // We show OUR price, not provider cost
            features: n.features,
            type: n.type
        }));

        // 2. Set Cache (5 Minutes)
        cacheService.set(cacheKey, available, 300);

        res.json(available);
    } catch (error) {
        console.error('Get Available Numbers Error:', error);
        res.status(500).json({ error: 'Failed to fetch numbers' });
    }
};

// 2. Rent Number
export const rentNumber = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user.id;
        const { msisdn, country, pin } = req.body;

        if (!msisdn) return res.status(400).json({ error: 'Phone number is required' });

        // Validate PIN
        await securityService.validateRequestPin(userId, pin);

        // Atomic Transaction: Deduct Wallet -> Create DB Record
        await prisma.$transaction(async (tx) => {
            // 1. Check Wallet
            const wallet = await tx.wallet.findFirst({ where: { userId, currency: 'NGN' } });
            if (!wallet || wallet.balance.toNumber() < NUMBER_MONTHLY_COST) {
                throw new Error('Insufficient funds');
            }

            // 2. Verify availability (Optional, skipped for speed)

            // 3. Call Provider (External API)
            // NOTE: Calling external API inside transaction is risky (latency), but ensures we don't charge if it fails immediately.
            // For better robustnes: Charge -> Pending Status -> Queue Job -> Provider -> Active.
            // Implemented simple version for now:
            await vonageProvider.rentNumber(country || 'NG', msisdn);

            // 4. Deduct Funds
            await tx.wallet.update({
                where: { id: wallet.id },
                data: { balance: { decrement: NUMBER_MONTHLY_COST } }
            });

            // 5. Create Transaction Log
            await tx.transaction.create({
                data: {
                    userId,
                    walletId: wallet.id,
                    amount: NUMBER_MONTHLY_COST,
                    total: NUMBER_MONTHLY_COST,
                    type: 'VIRTUAL_NUMBER_RENT',
                    status: 'SUCCESS',
                    reference: `VN_${Date.now()}`,
                    description: `Rented Number ${msisdn}`,
                    metadata: { msisdn, country }
                } as any
            });

            // 6. Create Virtual Number Record
            const nextBilling = new Date();
            nextBilling.setDate(nextBilling.getDate() + 30); // 30 Days expiry

            // @ts-ignore
            const sub = await tx.subscription.create({
                data: {
                    userId,
                    type: 'VIRTUAL_NUMBER',
                    nextBillingDate: nextBilling,
                    status: 'ACTIVE'
                }
            });

            // @ts-ignore
            await tx.virtualNumber.create({
                data: {
                    userId,
                    phoneNumber: msisdn,
                    providerMonthlyCost: 0, // Fill if provider returns cost
                    userMonthlyPrice: NUMBER_MONTHLY_COST,
                    subscriptionId: sub.id,
                    status: 'ACTIVE'
                }
            });
        });

        res.json({ message: 'Number rented successfully' });

    } catch (error: any) {
        console.error('Rent Number Error:', error);
        res.status(400).json({ error: error.message || 'Failed to rent number' });
    }
};

// 3. User's Numbers
export const getMyNumbers = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user.id;
        // @ts-ignore
        const numbers = await prisma.virtualNumber.findMany({
            where: { userId },
            include: { subscription: true, messages: { orderBy: { receivedAt: 'desc' }, take: 1 } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(numbers);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch your numbers' });
    }
};

// 5. Get Messages for a Number
export const getNumberMessages = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user.id;
        const { id } = req.params;

        // Verify ownership
        // @ts-ignore
        const vn = await prisma.virtualNumber.findFirst({
            where: { id, userId }
        });

        if (!vn) return res.status(404).json({ error: 'Number not found' });

        // @ts-ignore
        const messages = await prisma.smsMessage.findMany({
            where: { virtualNumberId: id },
            orderBy: { receivedAt: 'desc' },
            take: 50
        });

        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
};

// 6. Cancel Subscription
export const cancelNumberSubscription = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user.id;
        const { id } = req.body;

        // @ts-ignore
        const vn = await prisma.virtualNumber.findFirst({ where: { id, userId }, include: { subscription: true } });
        if (!vn) return res.status(404).json({ error: 'Number not found' });

        // Update Subscription
        // @ts-ignore
        if (vn.subscriptionId) {
            // @ts-ignore
            await prisma.subscription.update({
                // @ts-ignore
                where: { id: vn.subscriptionId },
                data: { status: 'CANCELLED', autoRenew: false }
            });
        }

        // @ts-ignore
        await prisma.virtualNumber.update({
            where: { id },
            // @ts-ignore
            data: { status: 'CANCELLED' }
        });

        res.json({ message: 'Subscription cancelled successfully' });

    } catch (error) {
        res.status(500).json({ error: 'Failed to cancel subscription' });
    }
};

// 4. Webhook (Inbound SMS)
export const handleSmsWebhook = async (req: Request, res: Response) => {
    try {
        const { msisdn, to, text, messageId } = req.body; // Vonage params

        // 1. Verify (Basic)
        if (!vonageProvider.verifySignature(req.body)) {
            return res.status(401).send('Invalid Signature');
        }

        // 2. Find Number Owner
        // 'to' is the virtual number receiving the SMS
        // @ts-ignore
        const virtualNumber = await prisma.virtualNumber.findUnique({
            where: { phoneNumber: to },
            include: { user: true }
        });

        if (virtualNumber) {
            // 3. Store Message
            // @ts-ignore
            await prisma.smsMessage.create({
                data: {
                    virtualNumberId: virtualNumber.id,
                    sender: msisdn, // The person sending the SMS
                    message: text
                }
            });

            // 4. Notify User (Real-time socket or push notification could go here)
            // For now, implicit via DB
        }

        res.status(200).send('OK');

    } catch (error) {
        console.error('Webhook Error:', error);
        res.status(200).send('OK'); // Always return 200 to provider to stop retries if it's our bug
    }
};
