import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { socketService } from '../services/socket.service';

const prisma = new PrismaClient();

// Get All Users (with optional search)
export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                phone: true,
                firstName: true,
                lastName: true,
                role: true,
                isVerified: true,
                isActive: true,
                createdAt: true,
                wallets: {
                    select: {
                        currency: true,
                        balance: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 100 // Pagination should be added in production
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Get All Transactions
export const getAllTransactions = async (req: Request, res: Response) => {
    try {
        const transactions = await prisma.transaction.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 100
        });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Get Analytics Stats
export const getAdminStats = async (req: Request, res: Response) => {
    try {
        const [totalUsers, totalTransactions, totalVolume] = await Promise.all([
            prisma.user.count(),
            prisma.transaction.count(),
            prisma.transaction.aggregate({
                _sum: {
                    amount: true
                },
                where: {
                    status: 'SUCCESS'
                }
            })
        ]);

        res.json({
            totalUsers,
            totalTransactions,
            totalVolume: totalVolume._sum.amount || 0
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

// Get All Services and their status
export const getServiceStatus = async (req: Request, res: Response) => {
    try {
        const services = await prisma.service.findMany({
            include: {
                provider: {
                    select: { name: true, code: true }
                }
            }
        });
        res.json(services);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch services' });
    }
};

// Toggle Service Active Status
export const updateServiceStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        const updatedService = await prisma.service.update({
            where: { id },
            data: { isActive }
        });

        res.json(updatedService);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update service' });
    }
};

// Get Providers and their balances
export const getProviderStatus = async (req: Request, res: Response) => {
    try {
        const providers = await prisma.provider.findMany();
        res.json(providers);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch providers' });
    }
};

// Toggle User Active Status (Block/Unblock)
export const updateUserStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        const updatedUser = await prisma.user.update({
            where: { id },
            data: { isActive },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                isActive: true
            }
        });

        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update user status' });
    }
};
// Update Gift Card Trade Status
export const updateGiftCardTradeStatus = async (req: Request, res: Response) => {
    try {
        const { reference } = req.params;
        const { status, adminNotes } = req.body; // SUCCESS or FAILED

        if (!['SUCCESS', 'FAILED'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status. Must be SUCCESS or FAILED' });
        }

        const transaction = await prisma.transaction.findUnique({
            where: { reference },
            include: { wallet: true }
        });

        if (!transaction) return res.status(404).json({ error: 'Transaction not found' });
        if (transaction.type !== 'GIFTCARD') return res.status(400).json({ error: 'Not a gift card transaction' });
        if (transaction.status !== 'PENDING') return res.status(400).json({ error: 'Transaction already processed' });

        await prisma.$transaction(async (tx) => {
            // Update transaction status
            await tx.transaction.update({
                where: { id: transaction.id },
                data: {
                    status,
                    metadata: {
                        ...(transaction.metadata as any),
                        adminNotes,
                        processedAt: new Date(),
                    }
                }
            });

            // If FAILED, reverse the optimistic credit
            if (status === 'FAILED') {
                await tx.wallet.update({
                    where: { id: transaction.walletId },
                    data: { balance: { decrement: transaction.amount } }
                });
            }
        });

        const updatedWallet = await prisma.wallet.findUnique({ where: { id: transaction.walletId } });
        socketService.emitToUser(transaction.userId, 'BALANCE_UPDATE', { balance: updatedWallet?.balance });
        socketService.emitToUser(transaction.userId, 'TRANSACTION_UPDATE', {
            reference,
            status,
            message: status === 'SUCCESS' ? 'Gift card trade approved!' : 'Gift card trade rejected and reversed'
        });

        res.json({ message: `Transaction ${status === 'SUCCESS' ? 'approved' : 'rejected'}` });
    } catch (error) {
        console.error('Update giftcard status error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
