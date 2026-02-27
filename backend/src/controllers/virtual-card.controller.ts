import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { WantToPayProvider } from '../providers/wanttopay.provider';

const prisma = new PrismaClient();
const cardProvider = new WantToPayProvider();

// Config (In prod, fetch from AdminSettings or DB)
const EXCHANGE_RATE_BUFFER = 50; // Add ₦50 to basic exchange rate per dollar
const CARD_CREATION_FEE_USD = 2.00; // $2 creation fee
const FORCE_EXCHANGE_RATE = 1650.00; // Mock Rate 1 USD = 1650 NGN

export const createCard = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user.id;
        const { amount, billingName, color } = req.body; // Amount in USD to fund

        if (!amount || Number(amount) < 5) return res.status(400).json({ error: 'Minimum funding amount is $5' });

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Calcs
        // Total Cost USD = Amount to Load + Creation Fee
        const totalUsdCost = Number(amount) + CARD_CREATION_FEE_USD;
        const exchangeRate = FORCE_EXCHANGE_RATE + EXCHANGE_RATE_BUFFER;
        const totalNgnCost = totalUsdCost * exchangeRate;

        // Atomic Transaction
        await prisma.$transaction(async (tx) => {
            // 1. Check Wallet
            const wallet = await tx.wallet.findFirst({ where: { userId, currency: 'NGN' } });
            if (!wallet || wallet.balance.toNumber() < totalNgnCost) {
                throw new Error(`Insufficient funds. You need ₦${totalNgnCost.toLocaleString()} (Rate: ₦${exchangeRate}/$)`);
            }

            // 2. Call Provider
            const cardData = await cardProvider.createCard(userId, Number(amount), billingName || `${user.firstName} ${user.lastName}`);

            // 3. Deduct Wallet
            await tx.wallet.update({
                where: { id: wallet.id },
                data: { balance: { decrement: totalNgnCost } }
            });

            // 4. Record Transaction
            await tx.transaction.create({
                data: {
                    userId,
                    walletId: wallet.id,
                    amount: totalNgnCost,
                    total: totalNgnCost,
                    type: 'VIRTUAL_CARD_CREATE',
                    status: 'SUCCESS',
                    reference: `VCC_${Date.now()}`,
                    description: `Created $${amount} Virtual Card`,
                    metadata: { cardId: cardData.cardId, usdAmount: amount, rate: exchangeRate }
                } as any
            });

            // 5. Save Card to DB
            await tx.virtualCard.create({
                data: {
                    userId,
                    name: billingName || `${user.firstName} ${user.lastName}`,
                    pan: cardData.pan,
                    fullPan: cardData.fullPan,
                    cvv: cardData.cvv,
                    expiry: cardData.expiry,
                    balance: Number(amount),
                    currency: 'USD',
                    status: 'ACTIVE',
                    color: color || 'blue',
                    // @ts-ignore
                    providerCardId: cardData.cardId
                }
            });
        });

        res.json({ message: 'Virtual Card created successfully' });

    } catch (error: any) {
        console.error('Create Card Error:', error);
        res.status(400).json({ error: error.message || 'Failed to create card' });
    }
};

export const getMyCards = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user.id;
        const cards = await prisma.virtualCard.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
        res.json(cards);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch cards' });
    }
};

export const getCardDetails = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user.id;
        const { cardId } = req.params;

        const card = await prisma.virtualCard.findFirst({ where: { id: cardId, userId } });
        if (!card) return res.status(404).json({ error: 'Card not found' });

        // Fetch latest balance/details from provider
        // @ts-ignore
        if (card.providerCardId) {
            try {
                // @ts-ignore
                const details = await cardProvider.getCardDetails(card.providerCardId);
                // Update local balance cache if changed
                // await prisma.virtualCard.update(...)
            } catch (e) { console.error("Provider sync failed", e); }
        }

        res.json(card);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch details' });
    }
};

export const toggleCardFreeze = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user.id;
        const { cardId } = req.body;

        const card = await prisma.virtualCard.findFirst({ where: { id: cardId, userId } });
        if (!card) return res.status(404).json({ error: 'Card not found' });

        // @ts-ignore
        const newStatus = card.frozen ? 'UNFREEZE' : 'FREEZE';

        // @ts-ignore
        if (card.providerCardId) {
            // @ts-ignore
            await cardProvider.toggleCardStatus(card.providerCardId, newStatus);
        }

        await prisma.virtualCard.update({
            where: { id: cardId },
            // @ts-ignore
            data: { frozen: !card.frozen, status: !card.frozen ? 'FROZEN' : 'ACTIVE' }
        });

        res.json({ message: `Card ${newStatus === 'FREEZE' ? 'frozen' : 'unfrozen'} successfully` });

    } catch (error) {
        res.status(500).json({ error: 'Failed to update card status' });
    }
};

export const fundCard = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user.id;
        const { cardId, amount } = req.body;

        if (!amount || Number(amount) < 1) return res.status(400).json({ error: 'Minimum funding amount is $1' });

        const card = await prisma.virtualCard.findFirst({ where: { id: cardId, userId } });
        if (!card) return res.status(404).json({ error: 'Card not found' });

        // @ts-ignore
        if (card.frozen) return res.status(400).json({ error: 'Cannot fund a frozen card' });

        // Calculate Cost
        // Funding Fee? Let's say 1% or $1 flat? Or standard exchange rate.
        // Usually just Exchange Rate.
        const exchangeRate = FORCE_EXCHANGE_RATE + EXCHANGE_RATE_BUFFER;
        const totalNgnCost = Number(amount) * exchangeRate;

        await prisma.$transaction(async (tx) => {
            // 1. Check Wallet
            const wallet = await tx.wallet.findFirst({ where: { userId, currency: 'NGN' } });
            if (!wallet || wallet.balance.toNumber() < totalNgnCost) {
                throw new Error(`Insufficient funds. You need ₦${totalNgnCost.toLocaleString()}`);
            }

            // 2. Call Provider
            // @ts-ignore
            if (card.providerCardId) {
                // @ts-ignore
                await cardProvider.fundCard(card.providerCardId, Number(amount));
            }

            // 3. Deduct Wallet
            await tx.wallet.update({
                where: { id: wallet.id },
                data: { balance: { decrement: totalNgnCost } }
            });

            // 4. Update Card Balance (Local)
            await tx.virtualCard.update({
                where: { id: cardId },
                data: { balance: { increment: Number(amount) } }
            });

            // 5. Record Transaction
            await tx.transaction.create({
                data: {
                    userId,
                    walletId: wallet.id,
                    amount: totalNgnCost,
                    total: totalNgnCost,
                    type: 'VIRTUAL_CARD_FUND',
                    status: 'SUCCESS',
                    reference: `VCF_${Date.now()}`,
                    description: `Funded Card with $${amount}`,
                    metadata: { cardId: card.id, usdAmount: amount, rate: exchangeRate }
                } as any
            });
        });

        res.json({ message: 'Card funded successfully' });

    } catch (error: any) {
        console.error('Fund Card Error:', error);
        res.status(400).json({ error: error.message || 'Failed to fund card' });
    }
};
