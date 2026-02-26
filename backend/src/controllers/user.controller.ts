import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

import { SecurityService } from '../services/security.service';
const securityService = new SecurityService();

export const setPin = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const { pin } = req.body;

        await securityService.setPin(userId, pin);
        res.json({ message: 'Transaction PIN set successfully' });
    } catch (error: any) {
        res.status(400).json({ error: error.message || 'Failed to set PIN' });
    }
};

export const getProfile = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                role: true,
                createdAt: true
            }
        });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
};

export const updateProfile = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const { firstName, lastName, phone } = req.body;

        const user = await prisma.user.update({
            where: { id: userId },
            data: { firstName, lastName, phone },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true
            }
        });

        res.json({ message: 'Profile updated successfully', user });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update profile' });
    }
};

export const changePassword = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const { currentPassword, newPassword } = req.body;

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
            return res.status(400).json({ error: 'Incorrect current password' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to change password' });
    }
};

export const submitKyc = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const { nin } = req.body;

        if (!nin || nin.length !== 11 || !/^\d+$/.test(nin)) {
            return res.status(400).json({ error: 'Invalid NIN format. Must be 11 digits.' });
        }

        // Mock Verification Logic (Auto-approve for now)
        await prisma.user.update({
            where: { id: userId },
            data: {
                nin,
                kycLevel: 1,
                isVerified: true
            }
        });

        res.json({ message: 'Identity verified successfully. You can now fund your wallet.' });
    } catch (error) {
        console.error('KYC Error:', error);
        res.status(500).json({ error: 'Failed to process Verification' });
    }
};

export const getReferralStats = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                _count: {
                    select: { referrals: true }
                }
            }
        });

        if (!user) return res.status(404).json({ error: 'User not found' });

        // Calculate earnings (mock for now, or sum transaction commissions)
        const earnings = 0;
        const totalReferrals = user._count.referrals;

        res.json({
            referralCode: user.referralCode,
            totalReferrals,
            earnings,
            referralLink: `https://paybills.com/register?ref=${user.referralCode}` // Frontend URL
        });

    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch referral stats' });
    }
};
