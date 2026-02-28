import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

import { SecurityService } from '../services/security.service';
const securityService = new SecurityService();

export const setPin = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { pin } = req.body;

        await securityService.setPin(userId, pin);
        res.json({ message: 'Transaction PIN set successfully' });
    } catch (error: any) {
        res.status(400).json({ error: error.message || 'Failed to set PIN' });
    }
};

export const getProfile = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
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
        const userId = (req as any).user.id;
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
        const userId = (req as any).user.id;
        const { currentPassword, newPassword } = req.body;

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.password || !(await bcrypt.compare(currentPassword, user.password))) {
            return res.status(400).json({ error: 'Incorrect current password or account uses Google sign-in' });
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

import { OtpService } from '../services/otp.service';
const otpService = new OtpService();

export const sendKycOtp = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.email) {
            return res.status(400).json({ error: 'Email address required for verification' });
        }

        const reference = await otpService.requestOtp(user.email);

        res.json({ message: 'Verification code sent to your email', reference });
    } catch (error: any) {
        console.error('Send KYC OTP Error:', error);
        res.status(500).json({ error: error.message || 'Failed to send verification code' });
    }
};

export const verifyKycOtp = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { reference, code } = req.body;

        if (!reference || !code) {
            return res.status(400).json({ error: 'Verification reference and code are required' });
        }

        const isValid = await otpService.validateOtp(reference, code);

        if (!isValid) {
            return res.status(400).json({ error: 'Invalid or expired verification code' });
        }

        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                kycLevel: 1,
                isVerified: true
            }
        });

        res.json({ message: 'Identity verified successfully. You can now fund your wallet.', kycLevel: user.kycLevel });
    } catch (error: any) {
        console.error('Verify KYC OTP Error:', error);
        res.status(500).json({ error: error.message || 'Failed to verify code' });
    }
};

export const getReferralStats = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;

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

export const updateUserTag = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        let { tag } = req.body;

        if (!tag || tag.length < 3) {
            return res.status(400).json({ error: 'Tag must be at least 3 characters long' });
        }

        if (!tag.startsWith('@')) {
            tag = '@' + tag;
        }

        // Check for disallowed characters
        if (!/^@[a-zA-Z0-9_]+$/.test(tag)) {
            return res.status(400).json({ error: 'Tag can only contain letters, numbers, and underscores' });
        }

        // Check availability
        const existing = await prisma.user.findUnique({ where: { userTag: tag } });
        if (existing && existing.id !== userId) {
            return res.status(400).json({ error: 'This tag is already taken' });
        }

        const user = await prisma.user.update({
            where: { id: userId },
            data: { userTag: tag },
            select: { id: true, userTag: true }
        });

        res.json({ message: 'Tag updated successfully', userTag: user.userTag });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update user tag' });
    }
};

export const deleteAccount = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;

        // Check for active balance/pending transactions (optional but recommended for fintech)
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // We mark as deleted/inactive rather than hard delete to comply with CBN retention policies (5 years)
        // while satisfying Apple's requirement for user-initiated account deletion.
        await prisma.user.update({
            where: { id: userId },
            data: {
                isActive: false,
                email: `deleted_${userId}_${Date.now()}_@paybills.ng`, // Scrub email to allow re-registration if desired
                phone: null,
                firstName: 'Deleted',
                lastName: 'User',
                userTag: `deleted_${userId}`
            }
        });

        res.json({ message: 'Account scheduled for deletion. You have been logged out.' });
    } catch (error) {
        console.error('Delete Account Error:', error);
        res.status(500).json({ error: 'Failed to process account deletion' });
    }
};
