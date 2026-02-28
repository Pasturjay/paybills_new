import { Request, Response } from 'express';
import { PrismaClient, Prisma, Wallet } from '@prisma/client';
import { ClubKonnectProvider } from '../providers/clubkonnect.provider';
import { SecurityService } from '../services/security.service';

const prisma = new PrismaClient();
const clubKonnectProvider = new ClubKonnectProvider();
const securityService = new SecurityService();

export const getProducts = async (req: Request, res: Response) => {
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
        const userId = (req as any).user.id;
        const { type, quantity = 1, pin, idempotencyKey } = req.body;

        await securityService.validateRequestPin(userId, pin);

        // Idempotency Check
        if (idempotencyKey) {
            const existing = await prisma.transaction.findFirst({ where: { userId, idempotencyKey } });
            if (existing) {
                return res.json({ message: 'Purchase already processed', type, quantity, status: existing.status });
            }
        }

        const prices: Record<string, number> = { 'WAEC': 3800, 'NECO': 1200, 'JAMB': 7700, 'NABTEB': 1500, 'NBAIS': 2000 };
        const cost = (prices[type] || 0) * quantity;

        if (cost === 0) return res.status(400).json({ error: 'Invalid Product Type' });

        await prisma.$transaction(async (tx) => {
            const walletResults = await tx.$queryRaw<Wallet[]>(
                Prisma.sql`SELECT * FROM "Wallet" WHERE "userId" = ${userId} AND "currency" = 'NGN' FOR UPDATE`
            );
            const wallet = walletResults[0];

            if (!wallet || Number(wallet.balance) < cost) {
                throw new Error('Insufficient funds');
            }

            await tx.wallet.update({
                where: { id: wallet.id },
                data: { balance: { decrement: cost } }
            });

            const ref = 'EDU_' + Date.now();
            const response = await clubKonnectProvider.purchaseEducationPIN(type, quantity, ref);

            if (response.status === 'FAILED') {
                throw new Error(response.message || 'Provider failed');
            }

            await tx.transaction.create({
                data: {
                    userId,
                    walletId: wallet.id,
                    amount: cost,
                    total: cost,
                    type: 'BILL_PAYMENT',
                    status: response.status === 'SUCCESS' ? 'SUCCESS' : 'PENDING',
                    reference: ref,
                    idempotencyKey,
                    metadata: {
                        type,
                        quantity,
                        tokens: response.token,
                        providerRef: response.providerReference
                    },
                    description: `Purchase ${quantity} ${type} PIN(s)`
                } as any
            });

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
        const userId = (req as any).user.id;
        const { cardId, amount, quantity = 1, pin, idempotencyKey } = req.body;

        await securityService.validateRequestPin(userId, pin);

        if (idempotencyKey) {
            const existing = await prisma.transaction.findFirst({ where: { userId, idempotencyKey } });
            if (existing) return res.json({ message: 'Purchase already processed' });
        }

        const cost = Number(amount) * quantity;

        await prisma.$transaction(async (tx) => {
            const walletResults = await tx.$queryRaw<Wallet[]>(
                Prisma.sql`SELECT * FROM "Wallet" WHERE "userId" = ${userId} AND "currency" = 'NGN' FOR UPDATE`
            );
            const wallet = walletResults[0];

            if (!wallet || Number(wallet.balance) < cost) throw new Error('Insufficient funds');

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
                    type: 'BILL_PAYMENT',
                    status: 'PENDING',
                    reference: 'GC_' + Date.now(),
                    idempotencyKey,
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
        res.json({ message: 'Trade initiated. Please wait for admin verification.' });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const purchaseAirtime = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { networkId, phoneNumber, amount, pin, idempotencyKey } = req.body;

        await securityService.validateRequestPin(userId, pin);

        if (idempotencyKey) {
            const existing = await prisma.transaction.findFirst({ where: { userId, idempotencyKey } });
            if (existing) return res.json({ message: 'Airtime purchase already processed', status: existing.status });
        }

        const cost = Number(amount);

        await prisma.$transaction(async (tx) => {
            const walletResults = await tx.$queryRaw<Wallet[]>(
                Prisma.sql`SELECT * FROM "Wallet" WHERE "userId" = ${userId} AND "currency" = 'NGN' FOR UPDATE`
            );
            const wallet = walletResults[0];

            if (!wallet || Number(wallet.balance) < cost) throw new Error('Insufficient funds');

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
                    idempotencyKey,
                    metadata: { networkId, phoneNumber, providerRef: response.providerReference },
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
        const userId = (req as any).user.id;
        const { networkId, planId, phoneNumber, amount, pin, idempotencyKey } = req.body;

        await securityService.validateRequestPin(userId, pin);

        if (idempotencyKey) {
            const existing = await prisma.transaction.findFirst({ where: { userId, idempotencyKey } });
            if (existing) return res.json({ message: 'Data purchase already processed', status: existing.status });
        }

        const cost = Number(amount);

        await prisma.$transaction(async (tx) => {
            const walletResults = await tx.$queryRaw<Wallet[]>(
                Prisma.sql`SELECT * FROM "Wallet" WHERE "userId" = ${userId} AND "currency" = 'NGN' FOR UPDATE`
            );
            const wallet = walletResults[0];

            if (!wallet || Number(wallet.balance) < cost) throw new Error('Insufficient funds');

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
                    idempotencyKey,
                    metadata: { networkId, planId, phoneNumber, providerRef: response.providerReference },
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
        const userId = (req as any).user.id;
        const { providerId, packageId, smartcardNumber, amount, pin, idempotencyKey } = req.body;

        await securityService.validateRequestPin(userId, pin);

        if (idempotencyKey) {
            const existing = await prisma.transaction.findFirst({ where: { userId, idempotencyKey } });
            if (existing) return res.json({ message: 'Cable subscription already processed', status: existing.status });
        }

        const cost = Number(amount);

        await prisma.$transaction(async (tx) => {
            const walletResults = await tx.$queryRaw<Wallet[]>(
                Prisma.sql`SELECT * FROM "Wallet" WHERE "userId" = ${userId} AND "currency" = 'NGN' FOR UPDATE`
            );
            const wallet = walletResults[0];

            if (!wallet || Number(wallet.balance) < cost) throw new Error('Insufficient funds');

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
                    idempotencyKey,
                    metadata: { providerId, packageId, smartcardNumber, providerRef: response.providerReference },
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
        const userId = (req as any).user.id;
        const { providerId, meterNumber, amount, pin, idempotencyKey } = req.body;

        if (!providerId || !meterNumber || !amount || !pin) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        await securityService.validateRequestPin(userId, pin);

        if (idempotencyKey) {
            const existing = await prisma.transaction.findFirst({ where: { userId, idempotencyKey } });
            if (existing) return res.json({ message: 'Electricity purchase already processed', status: existing.status });
        }

        const cost = Number(amount);

        const result = await prisma.$transaction(async (tx) => {
            const walletResults = await tx.$queryRaw<Wallet[]>(
                Prisma.sql`SELECT * FROM "Wallet" WHERE "userId" = ${userId} AND "currency" = 'NGN' FOR UPDATE`
            );
            const wallet = walletResults[0];

            if (!wallet || Number(wallet.balance) < cost) {
                throw new Error('Insufficient funds');
            }

            await tx.wallet.update({
                where: { id: wallet.id },
                data: { balance: { decrement: cost } }
            });

            const ref = 'ELEC_' + Date.now();
            const response = await clubKonnectProvider.purchaseElectricity(providerId, meterNumber, cost, ref);

            if (response.status === 'FAILED') {
                throw new Error(response.message || 'Provider failed');
            }

            await tx.transaction.create({
                data: {
                    userId,
                    walletId: wallet.id,
                    amount: cost,
                    total: cost,
                    type: 'BILL_PAYMENT',
                    status: response.status === 'SUCCESS' ? 'SUCCESS' : 'PENDING',
                    reference: ref,
                    idempotencyKey,
                    metadata: {
                        providerId,
                        meterNumber,
                        token: response.token,
                        providerRef: response.providerReference
                    },
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
        const userId = (req as any).user.id;
        const { customerId, bookmaker, amount, pin, idempotencyKey } = req.body;

        if (!customerId || !bookmaker || !amount || !pin) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        await securityService.validateRequestPin(userId, pin);

        if (idempotencyKey) {
            const existing = await prisma.transaction.findFirst({ where: { userId, idempotencyKey } });
            if (existing) return res.json({ message: 'Betting topup already processed', status: existing.status });
        }

        const result = await prisma.$transaction(async (tx) => {
            const walletResults = await tx.$queryRaw<Wallet[]>(
                Prisma.sql`SELECT * FROM "Wallet" WHERE "userId" = ${userId} AND "currency" = 'NGN' FOR UPDATE`
            );
            const wallet = walletResults[0];

            if (!wallet || Number(wallet.balance) < Number(amount)) {
                throw new Error('Insufficient funds');
            }

            await tx.wallet.update({
                where: { id: wallet.id },
                data: { balance: { decrement: Number(amount) } }
            });

            const ref = 'BET_' + Date.now();
            const response = await clubKonnectProvider.fundBettingWallet(customerId, Number(amount), bookmaker, ref);

            if (response.status === 'FAILED') {
                throw new Error(response.message || 'Provider failed');
            }

            await tx.transaction.create({
                data: {
                    userId,
                    walletId: wallet.id,
                    amount: Number(amount),
                    total: Number(amount),
                    type: 'BILL_PAYMENT',
                    status: response.status === 'SUCCESS' ? 'SUCCESS' : 'PENDING',
                    reference: ref,
                    idempotencyKey,
                    metadata: {
                        customerId,
                        bookmaker,
                        providerRef: response.providerReference
                    },
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

