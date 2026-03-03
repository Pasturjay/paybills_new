import { Request, Response } from 'express';
import prisma from '../prisma';
import jwt from 'jsonwebtoken';

// Lazy-load firebaseAdmin so startup doesn't crash if service account is missing
const getFirebaseAuth = async () => {
    try {
        const { auth } = await import('../config/firebase.config');
        return auth;
    } catch {
        return null;
    }
};

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_dev_only';

export const syncFirebaseUser = async (req: Request, res: Response) => {
    console.log('--- Sync Firebase User Started ---');
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        console.log('Token received:', token ? 'YES' : 'NO');

        if (!token) {
            console.warn('Sync failed: No token provided');
            return res.status(401).json({ error: 'Unauthorized: No token provided' });
        }

        // Verify the Firebase ID Token
        const firebaseAuth = await getFirebaseAuth();
        if (!firebaseAuth) {
            console.error('Sync failed: firebaseAuth is null');
            return res.status(503).json({ error: 'Firebase Admin not configured. Please add your service account.' });
        }

        console.log('Verifying token...');
        const decodedToken = await firebaseAuth.verifyIdToken(token);
        const { uid, email, name, picture, phone_number } = decodedToken;
        console.log('Token verified for UID:', uid, 'Email:', email);

        // Determine the auth provider
        const signInProvider = decodedToken.firebase?.sign_in_provider;
        const authProvider = signInProvider?.includes('google') ? 'GOOGLE'
            : signInProvider?.includes('apple') ? 'APPLE'
                : signInProvider === 'phone' ? 'PHONE'
                    : 'EMAIL';
        console.log('Provider detected:', authProvider);

        // Parse name into first/last if firstName/lastName not already set
        let firstName = '';
        let lastName = '';
        if (name) {
            const parts = (name as string).trim().split(' ');
            firstName = parts[0] || '';
            lastName = parts.slice(1).join(' ') || '';
        }

        console.log('Searching for user by firebaseUid:', uid);
        let user = await prisma.user.findUnique({
            where: { firebaseUid: uid },
        });

        if (!user) {
            console.log('User not found by firebaseUid. Checking fallback email/phone...');
            // Check if a user with the same email/phone exists (migration from old password auth)
            const searchConditions = [];
            if (email) searchConditions.push({ email });
            if (phone_number) searchConditions.push({ phone: phone_number as string });

            if (searchConditions.length > 0) {
                console.log('Search conditions:', JSON.stringify(searchConditions));
                user = await prisma.user.findFirst({
                    where: { OR: searchConditions }
                });
            }

            if (user) {
                console.log('Found existing user for migration. ID:', user.id);
                // Link Firebase UID to existing account
                user = await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        firebaseUid: uid,
                        authProvider,
                        lastLoginAt: new Date(),
                        avatarUrl: picture || user.avatarUrl,
                        firstName: user.firstName || firstName || undefined,
                        lastName: user.lastName || lastName || undefined,
                    },
                });
                console.log('User migrated successfully.');
            } else {
                console.log('No user found by email/phone. Creating new user...');
                // Create New User
                const baseCode = (firstName || 'USR').substring(0, 3).toUpperCase();
                let referralCode = `${baseCode}${Math.floor(1000 + Math.random() * 9000)}`;
                let isUniqueRC = false;
                while (!isUniqueRC) {
                    const check = await prisma.user.findUnique({ where: { referralCode } });
                    if (!check) isUniqueRC = true;
                    else referralCode = `${baseCode}${Math.floor(1000 + Math.random() * 9000)}`;
                }
                console.log('Generated referral code:', referralCode);

                user = await prisma.$transaction(async (tx) => {
                    console.log('Starting DB transaction for new user...');
                    const newUser = await tx.user.create({
                        data: {
                            email: email || undefined,
                            phone: phone_number ? (phone_number as string) : undefined,
                            firebaseUid: uid,
                            authProvider,
                            firstName: firstName || undefined,
                            lastName: lastName || undefined,
                            avatarUrl: picture || undefined,
                            isVerified: true,
                            referralCode,
                            lastLoginAt: new Date(),
                        },
                    });

                    console.log('Creating wallet for new user ID:', newUser.id);
                    await tx.wallet.create({
                        data: { userId: newUser.id, currency: 'NGN', balance: 0.00 },
                    });

                    return newUser;
                });
                console.log('New user created successfully. ID:', user.id);

                // Welcome email (non-blocking)
                if (email) {
                    try {
                        const { EmailService } = await import('../services/email.service');
                        const emailService = new EmailService();
                        const html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px"><h2 style="color:#4F46E5">Welcome to Paybills.ng, ${firstName || 'there'}!</h2><p>You now have access to fast and easy bill payments, wallet management, airtime, and more.</p><br/><p>Best regards,<br/><strong>The Paybills Team</strong></p></div>`;
                        emailService.sendEmail(email, 'Welcome to Paybills!', `Welcome, ${firstName || 'there'}!`, html, 'Welcome Email')
                            .catch(e => console.error('Non-fatal welcome email error:', e));
                    } catch (e) {
                        console.error('EmailService error:', e);
                    }
                }
            }
        } else {
            console.log('Found user by firebaseUid. ID:', user.id);
            // Update existing user login time and profile pic
            user = await prisma.user.update({
                where: { id: user.id },
                data: {
                    lastLoginAt: new Date(),
                    avatarUrl: picture || user.avatarUrl,
                    firstName: user.firstName || firstName || undefined,
                    lastName: user.lastName || lastName || undefined,
                },
            });
            console.log('Existing user updated.');
        }

        console.log('Generating session tokens...');
        const { AuthService } = await import('../services/auth.service');
        const { accessToken, refreshToken } = await AuthService.createSession(
            user.id,
            req.headers['user-agent'],
            req.ip || req.headers['x-forwarded-for'] as string
        );

        // Security: Set HTTP-Only Cookies
        const isProduction = process.env.NODE_ENV === 'production';

        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000 // 15 minutes
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        return res.json({
            message: 'User synced successfully',
            token: accessToken,
            user: {
                id: user.id,
                email: user.email,
                phone: user.phone,
                firstName: user.firstName,
                lastName: user.lastName,
                avatarUrl: user.avatarUrl,
                role: user.role,
                firebaseUid: user.firebaseUid,
            },
        });

    } catch (error: any) {
        console.error('Firebase Auth Sync Error:', error);

        // Handle specific Firebase errors
        if (error?.errorInfo?.code?.startsWith('auth/')) {
            return res.status(401).json({
                error: `Authentication Error: ${error.errorInfo.message || error.errorInfo.code}`,
                code: error.errorInfo.code
            });
        }

        // Handle Prisma errors
        if (error?.code?.startsWith('P')) {
            return res.status(500).json({
                error: 'Database error occurred during sync',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }

        return res.status(500).json({
            error: 'Sync failed: internal server error',
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// These are deprecated — kept so existing routes don't 404
export const requestOtp = async (req: Request, res: Response) =>
    res.status(410).json({ error: 'Deprecated. Use Firebase sign-in and POST /api/auth/sync.' });
export const register = async (req: Request, res: Response) =>
    res.status(410).json({ error: 'Deprecated. Use Firebase sign-in and POST /api/auth/sync.' });
export const login = async (req: Request, res: Response) =>
    res.status(410).json({ error: 'Deprecated. Use Firebase sign-in and POST /api/auth/sync.' });

export const refreshSession = async (req: Request, res: Response) => {
    try {
        // Read refresh token from HTTP-only cookie
        // Use cookie-parser in app.ts if not already used, or parse manually
        const cookies = req.headers.cookie;
        if (!cookies) return res.status(401).json({ error: 'No cookies found' });

        const refreshTokenMatch = cookies.match(/refreshToken=([^;]+)/);
        const refreshToken = refreshTokenMatch ? refreshTokenMatch[1] : null;

        if (!refreshToken) return res.status(401).json({ error: 'Refresh token not provided' });

        const { AuthService } = await import('../services/auth.service');
        const { accessToken, refreshToken: newRefreshToken } = await AuthService.refreshSession(
            refreshToken,
            req.ip || req.headers['x-forwarded-for'] as string
        );

        const isProduction = process.env.NODE_ENV === 'production';

        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000
        });

        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({ message: 'Session refreshed successfully', accessToken });
    } catch (error: any) {
        console.error('Refresh Session Error:', error);
        res.status(403).json({ error: error.message || 'Invalid or expired refresh token' });
    }
};

export const logout = async (req: Request, res: Response) => {
    try {
        const cookies = req.headers.cookie;
        const refreshTokenMatch = cookies?.match(/refreshToken=([^;]+)/);
        const refreshToken = refreshTokenMatch ? refreshTokenMatch[1] : null;

        if (refreshToken) {
            const { AuthService } = await import('../services/auth.service');
            await AuthService.revokeSession(refreshToken);
        }

        const isProduction = process.env.NODE_ENV === 'production';
        const cookieOptions = { httpOnly: true, secure: isProduction, sameSite: 'strict' as const };

        res.clearCookie('accessToken', cookieOptions);
        res.clearCookie('refreshToken', cookieOptions);

        res.json({ message: 'Logged out successfully' });
    } catch (error: any) {
        console.error('Logout Error:', error);
        res.status(500).json({ error: 'Failed to process logout' });
    }
};
