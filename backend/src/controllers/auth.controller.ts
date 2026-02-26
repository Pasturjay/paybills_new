import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { auth } from '../config/firebase.config';

const prisma = new PrismaClient();

// In Firebase Auth, "Login" and "Register" are largely handled on the client.
// The backend's job is to receive the Firebase ID Token, verify it, and sync 
// the user to the local PostgreSQL Database (Prisma) for relational mapping.

export const syncFirebaseUser = async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Unauthorized: No token provided' });
        }

        // 1. Verify the Firebase ID Token
        const decodedToken = await auth.verifyIdToken(token);
        const { uid, email, name, picture_url } = decodedToken;

        if (!email) {
            return res.status(400).json({ error: 'Email is required from Firebase provider' });
        }

        // 2. Split the displayName from Google into First/Last name
        let firstName = name || '';
        let lastName = '';
        if (firstName.includes(' ')) {
            const parts = firstName.split(' ');
            firstName = parts[0];
            lastName = parts.slice(1).join(' ');
        }

        // 3. Find existing user, or create one if they don't exist
        let user = await prisma.user.findUnique({
            where: { firebaseUid: uid },
        });

        if (!user) {
            // Check if they signed up previously via standard email/password (migration case)
            user = await prisma.user.findUnique({
                where: { email }
            });

            if (user) {
                // Migrate the old user strictly to Firebase Auth
                user = await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        firebaseUid: uid,
                        authProvider: "GOOGLE"
                    }
                });
            } else {
                // Generate a base referral code
                const baseCode = (firstName || 'USER').substring(0, 3).toUpperCase();
                let referralCode = `${baseCode}${Math.floor(1000 + Math.random() * 9000)}`;
                let isUniqueRC = false;
                while (!isUniqueRC) {
                    const check = await prisma.user.findUnique({ where: { referralCode } });
                    if (!check) isUniqueRC = true;
                    else referralCode = `${baseCode}${Math.floor(1000 + Math.random() * 9000)}`;
                }

                // Brand New User Signup
                user = await prisma.$transaction(async (tx) => {
                    const newUser = await tx.user.create({
                        data: {
                            email,
                            firebaseUid: uid,
                            authProvider: "GOOGLE",
                            firstName,
                            lastName,
                            isVerified: true, // Google accounts are implicitly verified
                            referralCode
                        },
                    });

                    // Create NGN Wallet
                    await tx.wallet.create({
                        data: {
                            userId: newUser.id,
                            currency: 'NGN',
                            balance: 0.00,
                        },
                    });

                    return newUser;
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
            }
        }

        // Return standard response structure matching old JWT auth, replacing actual JWT with Firebase metadata
        return res.json({
            message: 'User synced successfully',
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                role: user.role,
                firebaseUid: user.firebaseUid
            }
        });

    } catch (error) {
        console.error('Firebase Auth Sync Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Deprecated since Mailtrap OTP is unused with Firebase OAuth, keeping endpoint signature to prevent route crashing
export const requestOtp = async (req: Request, res: Response) => {
    res.status(400).json({ error: 'OTP authentication is deprecated in favor of Firebase Google OAuth.' });
};

export const register = async (req: Request, res: Response) => {
    res.status(400).json({ error: 'Manual registration is deprecated. Use POST /api/auth/sync instead with a Firebase ID Token.' });
};

export const login = async (req: Request, res: Response) => {
    res.status(400).json({ error: 'Manual login is deprecated. Use POST /api/auth/sync instead with a Firebase ID Token.' });
};
