import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Lazy-load firebaseAdmin so startup doesn't crash if service account is missing
const getFirebaseAuth = async () => {
    try {
        const { auth } = await import('../config/firebase.config');
        return auth;
    } catch {
        return null;
    }
};

export const syncFirebaseUser = async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Unauthorized: No token provided' });
        }

        // Verify the Firebase ID Token
        const firebaseAuth = await getFirebaseAuth();
        if (!firebaseAuth) {
            return res.status(503).json({ error: 'Firebase Admin not configured. Please add your service account.' });
        }

        const decodedToken = await firebaseAuth.verifyIdToken(token);
        const { uid, email, name, phone_number } = decodedToken;

        if (!email && !phone_number) {
            return res.status(400).json({ error: 'Email or phone number is required from Firebase provider' });
        }

        // Parse name into first/last
        let firstName = '';
        let lastName = '';
        if (name) {
            const parts = (name as string).trim().split(' ');
            firstName = parts[0] || '';
            lastName = parts.slice(1).join(' ') || '';
        }

        // Determine the identifier to search by
        const searchIdentifier = email
            ? { email }
            : { phone: phone_number as string };

        let user = await prisma.user.findUnique({
            where: { firebaseUid: uid },
        });

        if (!user) {
            // Check if a user with the same email/phone exists (migration from old password auth)
            user = await prisma.user.findFirst({
                where: { OR: [searchIdentifier, ...(email ? [{ email }] : [])] }
            });

            if (user) {
                // Migrate: bind firebase UID to the existing account
                user = await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        firebaseUid: uid,
                        authProvider: decodedToken.firebase?.sign_in_provider?.includes('google') ? 'GOOGLE'
                            : decodedToken.firebase?.sign_in_provider?.includes('apple') ? 'APPLE'
                                : decodedToken.firebase?.sign_in_provider === 'phone' ? 'PHONE'
                                    : 'EMAIL'
                    },
                });
            } else {
                // Brand New User
                const baseCode = (firstName || 'USR').substring(0, 3).toUpperCase();
                let referralCode = `${baseCode}${Math.floor(1000 + Math.random() * 9000)}`;
                let isUniqueRC = false;
                while (!isUniqueRC) {
                    const check = await prisma.user.findUnique({ where: { referralCode } });
                    if (!check) isUniqueRC = true;
                    else referralCode = `${baseCode}${Math.floor(1000 + Math.random() * 9000)}`;
                }

                const provider = decodedToken.firebase?.sign_in_provider?.includes('google') ? 'GOOGLE'
                    : decodedToken.firebase?.sign_in_provider?.includes('apple') ? 'APPLE'
                        : decodedToken.firebase?.sign_in_provider === 'phone' ? 'PHONE'
                            : 'EMAIL';

                user = await prisma.$transaction(async (tx) => {
                    const newUser = await tx.user.create({
                        data: {
                            email: email || undefined,
                            phone: phone_number ? (phone_number as string) : undefined,
                            firebaseUid: uid,
                            authProvider: provider,
                            firstName: firstName || undefined,
                            lastName: lastName || undefined,
                            isVerified: true,
                            referralCode,
                        },
                    });

                    await tx.wallet.create({
                        data: { userId: newUser.id, currency: 'NGN', balance: 0.00 },
                    });

                    return newUser;
                });

                // Welcome email (non-blocking, only if email available)
                if (email) {
                    try {
                        const { EmailService } = await import('../services/email.service');
                        const emailService = new EmailService();
                        const html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px"><h2 style="color:#4F46E5">Welcome to Paybills.ng, ${firstName || 'there'}!</h2><p>You now have access to fast and easy bill payments, wallet management, airtime, and more.</p><br/><p>Best regards,<br/><strong>The Paybills Team</strong></p></div>`;
                        emailService.sendEmail(email, 'Welcome to Paybills!', `Welcome, ${firstName || 'there'}!`, html, 'Welcome Email')
                            .catch(e => console.error('Non-fatal welcome email error:', e));
                    } catch (e) {
                        console.error('EmailService import failed:', e);
                    }
                }
            }
        }

        return res.json({
            message: 'User synced successfully',
            user: {
                id: user.id,
                email: user.email,
                phone: user.phone,
                firstName: user.firstName,
                role: user.role,
                firebaseUid: user.firebaseUid,
            },
        });

    } catch (error: any) {
        console.error('Firebase Auth Sync Error:', error);
        if (error?.errorInfo?.code === 'auth/id-token-expired') {
            return res.status(401).json({ error: 'Session expired. Please sign in again.' });
        }
        if (error?.errorInfo?.code === 'auth/argument-error' || error?.errorInfo?.code === 'auth/id-token-revoked') {
            return res.status(403).json({ error: 'Invalid authentication token.' });
        }
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

// These are deprecated — kept so existing routes don't 404
export const requestOtp = async (req: Request, res: Response) =>
    res.status(410).json({ error: 'Deprecated. Use Firebase sign-in and POST /api/auth/sync.' });
export const register = async (req: Request, res: Response) =>
    res.status(410).json({ error: 'Deprecated. Use Firebase sign-in and POST /api/auth/sync.' });
export const login = async (req: Request, res: Response) =>
    res.status(410).json({ error: 'Deprecated. Use Firebase sign-in and POST /api/auth/sync.' });
