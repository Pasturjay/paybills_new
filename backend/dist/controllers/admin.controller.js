"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserStatus = exports.getProviderStatus = exports.updateServiceStatus = exports.getServiceStatus = exports.getAdminStats = exports.getAllTransactions = exports.getAllUsers = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Get All Users (with optional search)
const getAllUsers = async (req, res) => {
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
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.getAllUsers = getAllUsers;
// Get All Transactions
const getAllTransactions = async (req, res) => {
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
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.getAllTransactions = getAllTransactions;
// Get Analytics Stats
const getAdminStats = async (req, res) => {
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
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.getAdminStats = getAdminStats;
// Get All Services and their status
const getServiceStatus = async (req, res) => {
    try {
        const services = await prisma.service.findMany({
            include: {
                provider: {
                    select: { name: true, code: true }
                }
            }
        });
        res.json(services);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch services' });
    }
};
exports.getServiceStatus = getServiceStatus;
// Toggle Service Active Status
const updateServiceStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;
        const updatedService = await prisma.service.update({
            where: { id },
            data: { isActive }
        });
        res.json(updatedService);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update service' });
    }
};
exports.updateServiceStatus = updateServiceStatus;
// Get Providers and their balances
const getProviderStatus = async (req, res) => {
    try {
        const providers = await prisma.provider.findMany();
        res.json(providers);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch providers' });
    }
};
exports.getProviderStatus = getProviderStatus;
// Toggle User Active Status (Block/Unblock)
const updateUserStatus = async (req, res) => {
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
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update user status' });
    }
};
exports.updateUserStatus = updateUserStatus;
