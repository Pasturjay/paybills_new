import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

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
