import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const register = async (req: Request, res: Response) => {
    try {
        console.log("Register Request Body:", req.body);
        const { email, phone, password, firstName, lastName } = req.body;

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
                    referredById: referrerId
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
