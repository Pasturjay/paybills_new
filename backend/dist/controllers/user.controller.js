"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReferralStats = exports.submitKyc = exports.changePassword = exports.updateProfile = exports.getProfile = exports.setPin = void 0;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
const security_service_1 = require("../services/security.service");
const securityService = new security_service_1.SecurityService();
const setPin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const { pin } = req.body;
        yield securityService.setPin(userId, pin);
        res.json({ message: 'Transaction PIN set successfully' });
    }
    catch (error) {
        res.status(400).json({ error: error.message || 'Failed to set PIN' });
    }
});
exports.setPin = setPin;
const getProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const user = yield prisma.user.findUnique({
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
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});
exports.getProfile = getProfile;
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const { firstName, lastName, phone } = req.body;
        const user = yield prisma.user.update({
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
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update profile' });
    }
});
exports.updateProfile = updateProfile;
const changePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const { currentPassword, newPassword } = req.body;
        const user = yield prisma.user.findUnique({ where: { id: userId } });
        if (!user || !(yield bcryptjs_1.default.compare(currentPassword, user.password))) {
            return res.status(400).json({ error: 'Incorrect current password' });
        }
        const hashedPassword = yield bcryptjs_1.default.hash(newPassword, 10);
        yield prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });
        res.json({ message: 'Password changed successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to change password' });
    }
});
exports.changePassword = changePassword;
const submitKyc = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const { nin } = req.body;
        if (!nin || nin.length !== 11 || !/^\d+$/.test(nin)) {
            return res.status(400).json({ error: 'Invalid NIN format. Must be 11 digits.' });
        }
        // Mock Verification Logic (Auto-approve for now)
        yield prisma.user.update({
            where: { id: userId },
            data: {
                nin,
                kycLevel: 1,
                isVerified: true
            }
        });
        res.json({ message: 'Identity verified successfully. You can now fund your wallet.' });
    }
    catch (error) {
        console.error('KYC Error:', error);
        res.status(500).json({ error: 'Failed to process Verification' });
    }
});
exports.submitKyc = submitKyc;
const getReferralStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const user = yield prisma.user.findUnique({
            where: { id: userId },
            include: {
                _count: {
                    select: { referrals: true }
                }
            }
        });
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        // Calculate earnings (mock for now, or sum transaction commissions)
        const earnings = 0;
        const totalReferrals = user._count.referrals;
        res.json({
            referralCode: user.referralCode,
            totalReferrals,
            earnings,
            referralLink: `https://paybills.com/register?ref=${user.referralCode}` // Frontend URL
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch referral stats' });
    }
});
exports.getReferralStats = getReferralStats;
