"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleSmsWebhook = exports.cancelNumberSubscription = exports.getNumberMessages = exports.getMyNumbers = exports.rentNumber = exports.getAvailableNumbers = void 0;
const client_1 = require("@prisma/client");
const vonage_provider_1 = require("../providers/vonage.provider");
const security_service_1 = require("../services/security.service");
const cache_service_1 = require("../services/cache.service");
const prisma = new client_1.PrismaClient();
const vonageProvider = new vonage_provider_1.VonageProvider();
const securityService = new security_service_1.SecurityService();
const cacheService = new cache_service_1.CacheService();
// Helper: Calculate Cost (In production, fetch from MarkupRule or DB)
const NUMBER_MONTHLY_COST = 5000.00; // NGN
// 1. Get Available Numbers
const getAvailableNumbers = async (req, res) => {
    try {
        const country = req.query.country || 'NG'; // Default Nigeria
        const cacheKey = `vn_search_${country}`;
        // 1. Check Cache
        const cached = cacheService.get(cacheKey);
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
    }
    catch (error) {
        console.error('Get Available Numbers Error:', error);
        res.status(500).json({ error: 'Failed to fetch numbers' });
    }
};
exports.getAvailableNumbers = getAvailableNumbers;
// 2. Rent Number
const rentNumber = async (req, res) => {
    try {
        // @ts-ignore
        const userId = req.user.id;
        const { msisdn, country, pin } = req.body;
        if (!msisdn)
            return res.status(400).json({ error: 'Phone number is required' });
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
                }
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
    }
    catch (error) {
        console.error('Rent Number Error:', error);
        res.status(400).json({ error: error.message || 'Failed to rent number' });
    }
};
exports.rentNumber = rentNumber;
// 3. User's Numbers
const getMyNumbers = async (req, res) => {
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
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch your numbers' });
    }
};
exports.getMyNumbers = getMyNumbers;
// 5. Get Messages for a Number
const getNumberMessages = async (req, res) => {
    try {
        // @ts-ignore
        const userId = req.user.id;
        const { id } = req.params;
        // Verify ownership
        // @ts-ignore
        const vn = await prisma.virtualNumber.findFirst({
            where: { id, userId }
        });
        if (!vn)
            return res.status(404).json({ error: 'Number not found' });
        // @ts-ignore
        const messages = await prisma.smsMessage.findMany({
            where: { virtualNumberId: id },
            orderBy: { receivedAt: 'desc' },
            take: 50
        });
        res.json(messages);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
};
exports.getNumberMessages = getNumberMessages;
// 6. Cancel Subscription
const cancelNumberSubscription = async (req, res) => {
    try {
        // @ts-ignore
        const userId = req.user.id;
        const { id } = req.body;
        // @ts-ignore
        const vn = await prisma.virtualNumber.findFirst({ where: { id, userId }, include: { subscription: true } });
        if (!vn)
            return res.status(404).json({ error: 'Number not found' });
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
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to cancel subscription' });
    }
};
exports.cancelNumberSubscription = cancelNumberSubscription;
// 4. Webhook (Inbound SMS)
const handleSmsWebhook = async (req, res) => {
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
    }
    catch (error) {
        console.error('Webhook Error:', error);
        res.status(200).send('OK'); // Always return 200 to provider to stop retries if it's our bug
    }
};
exports.handleSmsWebhook = handleSmsWebhook;
