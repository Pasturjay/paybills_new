import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { HisendService } from '../services/hisend.service';

const prisma = new PrismaClient();
const hisendService = new HisendService();

export const requestOtp = async (req: Request, res: Response) => {
    try {
        const { identifier, channel } = req.body;
        if (!identifier || !channel) {
            return res.status(400).json({ error: 'Identifier and channel are required' });
        }

        // Send OTP
        const reference = await hisendService.sendOtp(identifier, channel as 'email' | 'sms');
        res.json({ message: 'OTP sent successfully', reference });
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'Failed to send OTP' });
    }
};

export const register = async (req: Request, res: Response) => {
    try {
        console.log("Register Request Body:", req.body);
        const { email, phone, password, firstName, lastName, otp, reference } = req.body;

        if (!otp || !reference) {
            return res.status(400).json({ error: 'OTP and reference are required' });
        }

        // Validate OTP
        const isValidParams = await hisendService.validateOtp(reference, otp);
        if (!isValidParams) {
            return res.status(400).json({ error: 'Invalid or expired OTP' });
        }

        // Check if user exists
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ email }, { phone }],
            },
        });

        if (existingUser) {
            return res.status(400).json({ error: 'User with this email or phone already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate Referral Code (Simple)
        const baseCode = (firstName || 'USER').substring(0, 3).toUpperCase();
        const rand = Math.floor(1000 + Math.random() * 9000);
        let referralCode = `${baseCode}${rand}`;

        // Ensure uniqueness for referralCode
        let isUniqueRC = false;
        while (!isUniqueRC) {
            // @ts-ignore
            const check = await prisma.user.findUnique({ where: { referralCode } });
            if (!check) isUniqueRC = true;
            else referralCode = `${baseCode}${Math.floor(1000 + Math.random() * 9000)}`;
        }

        // User Tag (P2P)
        /*
        const baseTag = (firstName || 'User').replace(/\s/g, '');
        let userTag = `@${baseTag}${Math.floor(100 + Math.random() * 900)}`;
        let isUniqueTag = false;
        while (!isUniqueTag) {
            // @ts-ignore
            const check = await prisma.user.findUnique({ where: { userTag } });
            if (!check) isUniqueTag = true;
            else userTag = `@${baseTag}${Math.floor(100 + Math.random() * 9000)}`;
        }
        */

        // Resolve Referrer
        let referrerId = null;
        if (req.body.referralCode) {
            // @ts-ignore
            const referrer = await prisma.user.findUnique({ where: { referralCode: req.body.referralCode } });
            if (referrer) referrerId = referrer.id;
        }

        // Create User and Initial Wallet (Atomic Transaction)
        const result = await prisma.$transaction(async (tx: any) => {
            const user = await tx.user.create({
                data: {
                    email,
                    phone,
                    password: hashedPassword,
                    firstName,
                    lastName,
                    referralCode,
                    // userTag,
                    referredById: referrerId,
                    isVerified: true // Set verified since they passed OTP
                },
            });

            // Create NGN Wallet
            await tx.wallet.create({
                data: {
                    userId: user.id,
                    currency: 'NGN',
                    balance: 500000.00,
                },
            });

            return user;
        });

        // Send Welcome Email (Non-blocking)
        try {
            const { EmailService } = await import('../services/email.service');
            const emailService = new EmailService();
            const subject = "Welcome to Paybills!";
            const text = `Hello ${firstName || 'User'},\n\nWelcome to Paybills.ng! We are thrilled to have you onboard.\n\nBest regards,\nThe Paybills Team`;
            const html = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #4F46E5;">Welcome to Paybills.ng, ${firstName || ''}!</h2>
                    <p>We are thrilled to have you onboard. You can now easily fund your wallet, pay bills, and manage your finances seamlessly.</p>
                    <br/>
                    <p>Best regards,<br/><strong>The Paybills Team</strong></p>
                </div>
            `;

            emailService.sendEmail(email, subject, text, html, "Welcome Email").catch(e => console.error("Non-fatal email error:", e));
        } catch (e) {
            console.error('Failed to instantiate EmailService during registration', e);
        }

        res.status(201).json({ message: 'User registered successfully', userId: result.id });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        console.log("Login Request Body:", req.body);
        const { email, password } = req.body;

        // Allow login with Email OR Phone
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: email },
                    { phone: email } // inferred from input
                ]
            }
        });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is not defined");
        }

        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({ token, user: { id: user.id, email: user.email, firstName: user.firstName, role: user.role } });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
