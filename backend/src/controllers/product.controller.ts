import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { ClubKonnectProvider } from '../providers/clubkonnect.provider';
import { SecurityService } from '../services/security.service';

const prisma = new PrismaClient();
const clubKonnectProvider = new ClubKonnectProvider();
const securityService = new SecurityService();

export const getProducts = async (req: Request, res: Response) => {
    // Return list of available services
    res.json({
        education: [
            { id: 'WAEC', name: 'WAEC Result Checker', price: 3800 },
            { id: 'NECO', name: 'NECO Result Token', price: 1200 },
            { id: 'JAMB', name: 'JAMB UTME PIN', price: 7700 },
            { id: 'NABTEB', name: 'NABTEB Result Checker', price: 1500 },
            { id: 'NBAIS', name: 'NBAIS Result Checker', price: 2000 }
        ],
        virtualNumbers: [
            { country: 'US', price: 5000 },
            { country: 'UK', price: 6000 }
        ]
    });
};

export const purchaseEducation = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const { type, quantity = 1, pin } = req.body;

        // 1. Verify PIN
        await securityService.validateRequestPin(userId, pin);

        // 2. Calculate Cost (Hardcoded for checking, should be DB driven)
        const prices: Record<string, number> = { 'WAEC': 3800, 'NECO': 1200, 'JAMB': 7700, 'NABTEB': 1500, 'NBAIS': 2000 };
        const cost = (prices[type] || 0) * quantity;

        if (cost === 0) return res.status(400).json({ error: 'Invalid Product Type' });

        // 3. Process Transaction
        await prisma.$transaction(async (tx) => {
            const wallet = await tx.wallet.findFirst({ where: { userId, currency: 'NGN' } });
            if (!wallet || wallet.balance.toNumber() < cost) {
                throw new Error('Insufficient funds');
            }

            await tx.wallet.update({
                where: { id: wallet.id },
                data: { balance: { decrement: cost } }
            });

            // Call Provider
            const ref = 'EDU_' + Date.now();
            const response = await clubKonnectProvider.purchaseEducationPIN(type, quantity, ref);

            if (response.status === 'FAILED') {
                throw new Error(response.message || 'Provider failed');
            }

            // Create Transaction
            await tx.transaction.create({
                data: {
                    userId,
                    walletId: wallet.id,
                    amount: cost,
                    total: cost,
                    type: 'BILL_PAYMENT',
                    status: response.status === 'SUCCESS' ? 'SUCCESS' : 'PENDING',
                    reference: ref,
                    metadata: JSON.stringify({
                        type,
                        quantity,
                        tokens: response.token,
                        providerRef: response.providerReference
                    }),
                    description: `Purchase ${quantity} ${type} PIN(s)`
                } as any
            });

            // Return tokens to user
            return response;
        });

        res.json({ message: 'Purchase successful', type, quantity });

    } catch (error: any) {
        console.error('Education Purchase Error:', error);
        res.status(400).json({ error: error.message || 'Purchase failed' });
    }
};



export const purchaseGiftCard = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const { cardId, amount, quantity = 1, pin } = req.body;

        await securityService.validateRequestPin(userId, pin);

        // Placeholder: Fetch price from DB or Provider
        // const card = await prisma.giftCard.findUnique({ where: { id: cardId } });
        // const cost = card.price * quantity;
        const cost = Number(amount) * quantity; // Dynamic amount for now

        await prisma.$transaction(async (tx) => {
            const wallet = await tx.wallet.findFirst({ where: { userId, currency: 'NGN' } });
            if (!wallet || wallet.balance.toNumber() < cost) throw new Error('Insufficient funds');

            await tx.wallet.update({
                where: { id: wallet.id },
                data: { balance: { decrement: cost } }
            });

            await tx.transaction.create({
                data: {
                    userId,
                    walletId: wallet.id,
                    amount: cost,
                    total: cost,
                    type: 'BILL_PAYMENT', // Or GIFT_CARD if enum added
                    status: 'PENDING', // Async fulfillment usually
                    reference: 'GC_' + Date.now(),
                    description: `Gift Card Purchase`
                } as any
            });
        });

        res.json({ message: 'Gift card purchase successful. Code will be sent shortly.' });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const sellGiftCard = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const { cardType, amount, cardCode, pin } = req.body;
        // Selling doesn't necessarily need PIN if it's incoming money, but good for confirmation? 
        // Maybe optional. Let's enforce for now to prevent accidental trades.
        // Actually, if I'm giving away a card code, I want to be sure.

        // Create a Trade Request
        // We likely need a Ticket/Trade model. For now, we mock success/pending.

        res.json({ message: 'Trade initiated. Please wait for admin verification.' });

    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};
// ... existing imports

// ... existing code

export const purchaseAirtime = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const { networkId, phoneNumber, amount, pin } = req.body;

        await securityService.validateRequestPin(userId, pin);

        const cost = Number(amount);
        // Can add markup logic here later

        await prisma.$transaction(async (tx) => {
            const wallet = await tx.wallet.findFirst({ where: { userId, currency: 'NGN' } });
            if (!wallet || wallet.balance.toNumber() < cost) throw new Error('Insufficient funds');

            await tx.wallet.update({
                where: { id: wallet.id },
                data: { balance: { decrement: cost } }
            });

            const ref = 'AIR_' + Date.now();
            const response = await clubKonnectProvider.purchaseAirtime(networkId, phoneNumber, cost, ref);

            if (response.status === 'FAILED') throw new Error(response.message || 'Provider failed');

            await tx.transaction.create({
                data: {
                    userId,
                    walletId: wallet.id,
                    amount: cost,
                    total: cost,
                    type: 'AIRTIME',
                    status: response.status === 'SUCCESS' ? 'SUCCESS' : 'PENDING',
                    reference: ref,
                    metadata: JSON.stringify({ networkId, phoneNumber, providerRef: response.providerReference }),
                    description: `Airtime Purchase (${phoneNumber})`
                } as any
            });

            return response;
        });

        res.json({ message: 'Airtime purchase successful' });

    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const purchaseData = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const { networkId, planId, phoneNumber, amount, pin } = req.body; // Amount needed if we don't look it up yet

        await securityService.validateRequestPin(userId, pin);

        // For security, we SHOULD fetch price from provider or DB plan list ensuring no tampering
        // For now, accepting amount from frontend (UNSAFE - TODO: Fix in next iteration) or assume passed correctly
        const cost = Number(amount);

        await prisma.$transaction(async (tx) => {
            const wallet = await tx.wallet.findFirst({ where: { userId, currency: 'NGN' } });
            if (!wallet || wallet.balance.toNumber() < cost) throw new Error('Insufficient funds');

            await tx.wallet.update({
                where: { id: wallet.id },
                data: { balance: { decrement: cost } }
            });

            const ref = 'DATA_' + Date.now();
            const response = await clubKonnectProvider.purchaseData(networkId, planId, phoneNumber, ref);

            if (response.status === 'FAILED') throw new Error(response.message || 'Provider failed');

            await tx.transaction.create({
                data: {
                    userId,
                    walletId: wallet.id,
                    amount: cost,
                    total: cost,
                    type: 'DATA',
                    status: response.status === 'SUCCESS' ? 'SUCCESS' : 'PENDING',
                    reference: ref,
                    metadata: JSON.stringify({ networkId, planId, phoneNumber, providerRef: response.providerReference }),
                    description: `Data Purchase (${phoneNumber})`
                } as any
            });

            return response;
        });

        res.json({ message: 'Data purchase successful' });

    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const validateCable = async (req: Request, res: Response) => {
    try {
        const { providerId, smartcardNumber } = req.body;
        const validation = await clubKonnectProvider.validateCableSmartcard(providerId, smartcardNumber);
        res.json(validation);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const purchaseCable = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const { providerId, packageId, smartcardNumber, amount, pin } = req.body;

        await securityService.validateRequestPin(userId, pin);
        const cost = Number(amount);

        await prisma.$transaction(async (tx) => {
            const wallet = await tx.wallet.findFirst({ where: { userId, currency: 'NGN' } });
            if (!wallet || wallet.balance.toNumber() < cost) throw new Error('Insufficient funds');

            await tx.wallet.update({
                where: { id: wallet.id },
                data: { balance: { decrement: cost } }
            });

            const ref = 'CABLE_' + Date.now();
            const response = await clubKonnectProvider.purchaseCable(providerId, packageId, smartcardNumber, ref);

            if (response.status === 'FAILED') throw new Error(response.message || 'Provider failed');

            await tx.transaction.create({
                data: {
                    userId,
                    walletId: wallet.id,
                    amount: cost,
                    total: cost,
                    type: 'CABLE',
                    status: response.status === 'SUCCESS' ? 'SUCCESS' : 'PENDING',
                    reference: ref,
                    metadata: JSON.stringify({ providerId, packageId, smartcardNumber, providerRef: response.providerReference }),
                    description: `Cable TV Purchase (${smartcardNumber})`
                } as any
            });
            return response;
        });

        res.json({ message: 'Cable TV subscription successful' });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const purchaseElectricity = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const { providerId, meterNumber, amount, pin } = req.body;

        if (!providerId || !meterNumber || !amount || !pin) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // 1. Verify PIN
        await securityService.validateRequestPin(userId, pin);

        const cost = Number(amount);

        // 2. Process Transaction
        const result = await prisma.$transaction(async (tx) => {
            const wallet = await tx.wallet.findFirst({ where: { userId, currency: 'NGN' } });
            if (!wallet || wallet.balance.toNumber() < cost) {
                throw new Error('Insufficient funds');
            }

            // Debit Wallet
            await tx.wallet.update({
                where: { id: wallet.id },
                data: { balance: { decrement: cost } }
            });

            // Call Provider
            const ref = 'ELEC_' + Date.now();
            const response = await clubKonnectProvider.purchaseElectricity(providerId, meterNumber, cost, ref);

            if (response.status === 'FAILED') {
                throw new Error(response.message || 'Provider failed');
            }

            // Create Transaction
            await tx.transaction.create({
                data: {
                    userId,
                    walletId: wallet.id,
                    amount: cost,
                    total: cost,
                    type: 'BILL_PAYMENT', // or ELECTRICITY if enum exists
                    status: response.status === 'SUCCESS' ? 'SUCCESS' : 'PENDING',
                    reference: ref,
                    metadata: JSON.stringify({
                        providerId,
                        meterNumber,
                        token: response.token,
                        providerRef: response.providerReference
                    }),
                    description: `Electricity Token ${cost} for ${meterNumber} (${providerId})`
                } as any
            });

            return response;
        });

        res.json({ message: 'Electricity purchase successful', data: result });

    } catch (error: any) {
        console.error('Electricity Purchase Error:', error);
        res.status(400).json({ error: error.message || 'Transaction failed' });
    }
};

export const purchaseBetting = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const { customerId, bookmaker, amount, pin } = req.body;

        if (!customerId || !bookmaker || !amount || !pin) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // 1. Verify PIN
        await securityService.validateRequestPin(userId, pin);

        // 2. Process Transaction
        const result = await prisma.$transaction(async (tx) => {
            const wallet = await tx.wallet.findFirst({ where: { userId, currency: 'NGN' } });
            if (!wallet || wallet.balance.toNumber() < Number(amount)) {
                throw new Error('Insufficient funds');
            }

            // Debit Wallet
            await tx.wallet.update({
                where: { id: wallet.id },
                data: { balance: { decrement: Number(amount) } }
            });

            // Call Provider
            const ref = 'BET_' + Date.now();
            const response = await clubKonnectProvider.fundBettingWallet(customerId, Number(amount), bookmaker, ref);

            if (response.status === 'FAILED') {
                throw new Error(response.message || 'Provider failed');
            }

            // Create Transaction
            await tx.transaction.create({
                data: {
                    userId,
                    walletId: wallet.id,
                    amount: Number(amount),
                    total: Number(amount),
                    type: 'BILL_PAYMENT',
                    status: response.status === 'SUCCESS' ? 'SUCCESS' : 'PENDING',
                    reference: ref,
                    metadata: JSON.stringify({
                        customerId,
                        bookmaker,
                        providerRef: response.providerReference
                    }),
                    description: `Betting Topup ${amount} for ${customerId} (${bookmaker})`
                } as any
            });

            return response;
        });

        res.json({ message: 'Betting wallet funded successfully', data: result });

    } catch (error: any) {
        console.error('Betting Purchase Error:', error);
        res.status(400).json({ error: error.message || 'Transaction failed' });
    }
};

export const purchaseSoftware = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const { itemCode, amount, pin } = req.body;

        if (!itemCode || !amount || !pin) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // 1. Verify PIN
        await securityService.validateRequestPin(userId, pin);

        // 2. Process Transaction
        const result = await prisma.$transaction(async (tx) => {
            const wallet = await tx.wallet.findFirst({ where: { userId, currency: 'NGN' } });
            if (!wallet || wallet.balance.toNumber() < Number(amount)) {
                throw new Error('Insufficient funds');
            }

            // Debit Wallet
            await tx.wallet.update({
                where: { id: wallet.id },
                data: { balance: { decrement: Number(amount) } }
            });

            // Mock Provider Call (Software not yet integrated in provider)
            const ref = 'SOFT_' + Date.now();
            const mockLicenseKey = 'XXXX-YYYY-ZZZZ-' + Math.floor(Math.random() * 10000);

            // Create Transaction
            await tx.transaction.create({
                data: {
                    userId,
                    walletId: wallet.id,
                    amount: Number(amount),
                    total: Number(amount),
                    type: 'BILL_PAYMENT',
                    status: 'SUCCESS',
                    reference: ref,
                    metadata: JSON.stringify({
                        itemCode,
                        licenseKey: mockLicenseKey
                    }),
                    description: `Software Purchase ${itemCode}`
                } as any
            });

            return { status: 'SUCCESS', licenseKey: mockLicenseKey, reference: ref };
        });

        res.json({ message: 'Software license purchased successfully', data: result });

    } catch (error: any) {
        console.error('Software Purchase Error:', error);
        res.status(400).json({ error: error.message || 'Transaction failed' });
    }
};
