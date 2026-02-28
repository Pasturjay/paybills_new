import { Request, Response } from 'express';
import { PrismaClient, TransactionType, TransactionStatus, Wallet, Prisma } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { SecurityService } from '../services/security.service';

const prisma = new PrismaClient();
const securityService = new SecurityService();

// Purchase Airtime
export const purchaseAirtime = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = (req as any).user.id;
        const { providerCode, amount, phone, network, pin, idempotencyKey } = req.body;

        // 0. Validate PIN
        try {
            await securityService.validateRequestPin(userId, pin);
        } catch (pinError: any) {
            return res.status(401).json({ error: pinError.message });
        }

        // 0.1 Check for Idempotency
        if (idempotencyKey) {
            const existingTx = await prisma.transaction.findFirst({
                where: { userId, idempotencyKey }
            });
            if (existingTx) {
                console.log(`[Idempotency] Duplicate request blocked for ${idempotencyKey}`);
                return res.json({
                    status: 'success',
                    message: 'Airtime purchase already processed',
                    reference: existingTx.reference,
                    amount: existingTx.amount,
                    phone: (existingTx.metadata as any)?.phone,
                    network: (existingTx.metadata as any)?.network
                });
            }
        }

        const reference = uuidv4();

        // 1. Transactional Block with Pessimistic Locking
        const result = await prisma.$transaction(async (tx) => {
            // A. Fetch & Lock Wallet
            const walletResults = await tx.$queryRaw<Wallet[]>(
                Prisma.sql`SELECT * FROM "Wallet" WHERE "userId" = ${userId} AND "currency" = 'NGN' FOR UPDATE`
            );
            const wallet = walletResults[0];

            if (!wallet) throw new Error("Wallet not found");
            const balance = typeof wallet.balance === 'number' ? wallet.balance : Number(wallet.balance);
            if (balance < Number(amount)) throw new Error("Insufficient balance");

            // B. Create Pending Transaction
            const transaction = await tx.transaction.create({
                data: {
                    userId,
                    walletId: wallet.id,
                    amount: Number(amount),
                    total: Number(amount),
                    type: TransactionType.AIRTIME,
                    status: TransactionStatus.PENDING,
                    reference,
                    idempotencyKey,
                    metadata: { network, phone, providerCode }
                }
            });

            // C. Debit Wallet
            const updatedWallet = await tx.wallet.update({
                where: { id: wallet.id },
                data: { balance: { decrement: Number(amount) } }
            });

            if (updatedWallet.balance.toNumber() < 0) {
                throw new Error("Insufficient balance (Race Condition)");
            }

            return { transaction, reference };
        });

        // 2. Call Provider API (Simulated)
        const success = true;

        if (success) {
            await prisma.transaction.update({
                where: { id: result.transaction.id },
                data: { status: TransactionStatus.SUCCESS, externalRef: `PROV-${uuidv4()}` }
            });

            return res.json({
                status: 'success',
                message: 'Airtime purchase successful',
                reference: result.reference,
                amount,
                phone,
                network
            });
        } else {
            // Reversal logic would be here if provider failed sync
            return res.status(502).json({ error: "Provider failed" });
        }

    } catch (error: any) {
        console.error('Airtime Error:', error);
        res.status(400).json({ error: error.message || 'Internal Server Error' });
    }
};

// Purchase Data Bundle
export const purchaseData = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = (req as any).user.id;
        const { providerCode, planCode, amount, phone, network, pin, idempotencyKey } = req.body;

        // 0. Validate PIN
        try {
            await securityService.validateRequestPin(userId, pin);
        } catch (pinError: any) {
            return res.status(401).json({ error: pinError.message });
        }

        // 0.1 Check for Idempotency
        if (idempotencyKey) {
            const existingTx = await prisma.transaction.findFirst({
                where: { userId, idempotencyKey }
            });
            if (existingTx) {
                return res.json({
                    status: 'success',
                    message: 'Data bundle already processed',
                    reference: existingTx.reference,
                    amount: existingTx.amount,
                    phone: (existingTx.metadata as any)?.phone,
                    network: (existingTx.metadata as any)?.network
                });
            }
        }

        const reference = uuidv4();

        const result = await prisma.$transaction(async (tx) => {
            // A. Fetch & Lock Wallet
            const walletResults = await tx.$queryRaw<Wallet[]>(
                Prisma.sql`SELECT * FROM "Wallet" WHERE "userId" = ${userId} AND "currency" = 'NGN' FOR UPDATE`
            );
            const wallet = walletResults[0];

            if (!wallet) throw new Error("Wallet not found");
            const balance = typeof wallet.balance === 'number' ? wallet.balance : Number(wallet.balance);
            if (balance < Number(amount)) throw new Error("Insufficient balance");

            // B. Create Pending Transaction
            const transaction = await tx.transaction.create({
                data: {
                    userId,
                    walletId: wallet.id,
                    amount: Number(amount),
                    total: Number(amount),
                    type: TransactionType.DATA,
                    status: TransactionStatus.PENDING,
                    reference,
                    idempotencyKey,
                    metadata: { network, phone, planCode, providerCode }
                }
            });

            // C. Debit Wallet
            await tx.wallet.update({
                where: { id: wallet.id },
                data: { balance: { decrement: Number(amount) } }
            });

            return { transaction, reference };
        });

        const success = true;

        if (success) {
            await prisma.transaction.update({
                where: { id: result.transaction.id },
                data: { status: TransactionStatus.SUCCESS, externalRef: `PROV-DATA-${uuidv4()}` }
            });

            return res.json({
                status: 'success',
                message: 'Data bundle purchase successful',
                reference: result.reference,
                amount,
                phone,
                network
            });
        } else {
            return res.status(502).json({ error: "Provider failed" });
        }

    } catch (error: any) {
        console.error('Data Bundle Error:', error);
        res.status(400).json({ error: error.message || 'Internal Server Error' });
    }
};

// Verify Customer
export const verifyCustomer = async (req: Request, res: Response) => {
    try {
        const { serviceCode, customerId, providerCode } = req.body;
        let customerName = "Simulated User";

        if (serviceCode.includes("ELECT")) {
            customerName = "METER: JOHN DOE";
        } else if (serviceCode.includes("TV")) {
            customerName = "TV: JANE DOE";
        }

        res.json({
            status: 'success',
            data: { customerName, customerId, serviceCode }
        });
    } catch (error) {
        res.status(500).json({ error: "Verification Failed" });
    }
}

// Purchase Bill (Electricity / TV)
export const purchaseBill = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = (req as any).user.id;
        const { serviceCode, customerId, amount, phone, type, providerCode, pin, idempotencyKey } = req.body;

        // 0. Validate PIN
        try {
            await securityService.validateRequestPin(userId, pin);
        } catch (pinError: any) {
            return res.status(401).json({ error: pinError.message });
        }

        // 0.1 Check for Idempotency
        if (idempotencyKey) {
            const existingTx = await prisma.transaction.findFirst({
                where: { userId, idempotencyKey }
            });
            if (existingTx) {
                return res.json({
                    status: 'success',
                    message: 'Bill payment already processed',
                    reference: existingTx.reference,
                    amount: existingTx.amount,
                    token: (existingTx.metadata as any)?.token
                });
            }
        }

        const reference = uuidv4();

        const result = await prisma.$transaction(async (tx) => {
            // A. Fetch & Lock Wallet
            const walletResults = await tx.$queryRaw<Wallet[]>(
                Prisma.sql`SELECT * FROM "Wallet" WHERE "userId" = ${userId} AND "currency" = 'NGN' FOR UPDATE`
            );
            const wallet = walletResults[0];

            if (!wallet) throw new Error("Wallet not found");
            const balance = typeof wallet.balance === 'number' ? wallet.balance : Number(wallet.balance);
            if (balance < Number(amount)) throw new Error("Insufficient balance");

            // B. Create Transaction
            const transaction = await tx.transaction.create({
                data: {
                    userId,
                    walletId: wallet.id,
                    amount: Number(amount),
                    total: Number(amount),
                    type: type === 'ELECTRICITY' ? TransactionType.ELECTRICITY : TransactionType.CABLE,
                    status: TransactionStatus.PENDING,
                    reference,
                    idempotencyKey,
                    metadata: { customerId, serviceCode, phone, providerCode }
                }
            });

            // C. Debit Wallet
            await tx.wallet.update({
                where: { id: wallet.id },
                data: { balance: { decrement: Number(amount) } }
            });

            return { transaction, reference };
        });

        const success = true;

        if (success) {
            await prisma.transaction.update({
                where: { id: result.transaction.id },
                data: { status: TransactionStatus.SUCCESS, externalRef: `PROV-BILL-${uuidv4()}` }
            });

            return res.json({
                status: 'success',
                message: 'Bill payment successful',
                reference: result.reference,
                amount,
                token: type === 'ELECTRICITY' ? '1234-5678-9012-3456' : undefined
            });
        } else {
            return res.status(502).json({ error: "Provider failed" });
        }

    } catch (error: any) {
        console.error('Bill Payment Error:', error);
        res.status(400).json({ error: error.message || 'Internal Server Error' });
    }
}

