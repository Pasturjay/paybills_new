import { Request, Response } from 'express';
import { PrismaClient, TransactionType, TransactionStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

// Purchase Airtime
export const purchaseAirtime = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = (req as any).user.id;
        const { providerCode, amount, phone, network } = req.body;

        // 1. Validate Balance
        const wallet = await prisma.wallet.findFirst({
            where: { userId, currency: 'NGN' }
        });

        if (!wallet || Number(wallet.balance) < Number(amount)) {
            return res.status(400).json({ error: "Insufficient balance" });
        }

        // 2. Create Pending Transaction
        const reference = uuidv4();
        const transaction = await prisma.transaction.create({
            data: {
                userId,
                walletId: wallet.id,
                amount: Number(amount),
                total: Number(amount), // Add fee logic here if needed
                type: TransactionType.AIRTIME,
                status: TransactionStatus.PENDING,
                reference,
                metadata: {
                    network,
                    phone,
                    providerCode
                }
            }
        });

        // 3. Debit Wallet (Pessimistic Locking ideally, but atomic update here)
        await prisma.wallet.update({
            where: { id: wallet.id },
            data: { balance: { decrement: Number(amount) } }
        });

        // 4. Call Provider API (Simulated)
        // const providerResponse = await vtpass.purchaseAirtime(...)
        const success = true; // Simulate success

        if (success) {
            // 5. Update Transaction to Success
            await prisma.transaction.update({
                where: { id: transaction.id },
                data: { status: TransactionStatus.SUCCESS, externalRef: `PROV-${uuidv4()}` }
            });

            return res.json({
                status: 'success',
                message: 'Airtime purchase successful',
                reference,
                amount,
                phone,
                network
            });
        } else {
            // 5b. Fail & Refund
            // ... Reversal logic
            return res.status(502).json({ error: "Provider failed" });
        }

    } catch (error) {
        console.error('Airtime Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Purchase Data Bundle
export const purchaseData = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = (req as any).user.id;
        const { providerCode, planCode, amount, phone, network } = req.body;

        // 1. Validate Balance
        const wallet = await prisma.wallet.findFirst({
            where: { userId, currency: 'NGN' }
        });

        if (!wallet || Number(wallet.balance) < Number(amount)) {
            return res.status(400).json({ error: "Insufficient balance" });
        }

        // 2. Create Pending Transaction
        const reference = uuidv4();
        const transaction = await prisma.transaction.create({
            data: {
                userId,
                walletId: wallet.id,
                amount: Number(amount),
                total: Number(amount),
                type: TransactionType.DATA,
                status: TransactionStatus.PENDING,
                reference,
                metadata: {
                    network,
                    phone,
                    planCode,
                    providerCode
                }
            }
        });

        // 3. Debit Wallet
        await prisma.wallet.update({
            where: { id: wallet.id },
            data: { balance: { decrement: Number(amount) } }
        });

        // 4. Call Provider API (Simulated)
        // const providerResponse = await vtpass.purchaseData(...)
        const success = true;

        if (success) {
            await prisma.transaction.update({
                where: { id: transaction.id },
                data: { status: TransactionStatus.SUCCESS, externalRef: `PROV-DATA-${uuidv4()}` }
            });

            return res.json({
                status: 'success',
                message: 'Data bundle purchase successful',
                reference,
                amount,
                phone,
                network
            });
        } else {
            // Reversal logic would go here
            return res.status(502).json({ error: "Provider failed" });
        }

    } catch (error) {
        console.error('Data Bundle Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Verify Customer (Meter or Smartcard)
export const verifyCustomer = async (req: Request, res: Response) => {
    try {
        const { serviceCode, customerId, providerCode } = req.body;

        // Simulated Verification Response
        // In prod, call provider API (e.g., VTpass/Baxi)

        let customerName = "Simulated User";

        if (serviceCode.includes("ELECT")) {
            customerName = "METER: JOHN DOE";
        } else if (serviceCode.includes("TV")) {
            customerName = "TV: JANE DOE";
        }

        res.json({
            status: 'success',
            data: {
                customerName,
                customerId,
                serviceCode
            }
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
        const { serviceCode, customerId, amount, phone, type, providerCode } = req.body;
        // type: 'ELECTRICITY' | 'TV'

        // 1. Validate Balance
        const wallet = await prisma.wallet.findFirst({
            where: { userId, currency: 'NGN' }
        });

        if (!wallet || Number(wallet.balance) < Number(amount)) {
            return res.status(400).json({ error: "Insufficient balance" });
        }

        // 2. Create Transaction
        const reference = uuidv4();
        const transaction = await prisma.transaction.create({
            data: {
                userId,
                walletId: wallet.id,
                amount: Number(amount),
                total: Number(amount),
                type: type === 'ELECTRICITY' ? TransactionType.ELECTRICITY : TransactionType.CABLE,
                status: TransactionStatus.PENDING,
                reference,
                metadata: {
                    customerId, // Meter or Smartcard
                    serviceCode,
                    phone,
                    providerCode
                }
            }
        });

        // 3. Debit Wallet
        await prisma.wallet.update({
            where: { id: wallet.id },
            data: { balance: { decrement: Number(amount) } }
        });

        // 4. Call Provider API
        const success = true;

        if (success) {
            await prisma.transaction.update({
                where: { id: transaction.id },
                data: { status: TransactionStatus.SUCCESS, externalRef: `PROV-BILL-${uuidv4()}` }
            });

            return res.json({
                status: 'success',
                message: 'Bill payment successful',
                reference,
                amount,
                token: type === 'ELECTRICITY' ? '1234-5678-9012-3456' : undefined // Return token for prepaid
            });
        } else {
            return res.status(502).json({ error: "Provider failed" });
        }

    } catch (error) {
        console.error('Bill Payment Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
