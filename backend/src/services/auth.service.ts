import jwt from 'jsonwebtoken';
import prisma from '../prisma';
import crypto from 'crypto';

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'fallback_access_secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret';
const JWT_ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES || '15m'; // 15 minutes
const JWT_REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES || '7d'; // 7 days

export class AuthService {
    /**
     * Generate an Access Token (Short-lived)
     */
    static generateAccessToken(user: any) {
        return jwt.sign(
            { id: user.id, email: user.email, role: user.role, uid: user.firebaseUid },
            JWT_ACCESS_SECRET,
            { expiresIn: JWT_ACCESS_EXPIRES as any }
        );
    }

    /**
     * Generate a Refresh Token (Long-lived)
     */
    static generateRefreshToken(user: any) {
        return jwt.sign(
            { id: user.id },
            JWT_REFRESH_SECRET,
            { expiresIn: JWT_REFRESH_EXPIRES as any }
        );
    }

    /**
     * Create or rotate a session with a new refresh token
     */
    static async createSession(userId: string, deviceInfo?: string, ipAddress?: string): Promise<{ accessToken: string, refreshToken: string }> {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new Error('User not found');

        const accessToken = this.generateAccessToken(user);
        const refreshToken = this.generateRefreshToken(user);

        // Store the refresh token in the database for invalidation
        await prisma.session.create({
            data: {
                userId,
                token: crypto.randomBytes(32).toString('hex'), // Legacy access token placeholder
                refreshToken,
                deviceInfo,
                ipAddress,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
            }
        });

        return { accessToken, refreshToken };
    }

    /**
     * Verify a Refresh Token and issue new tokens (Rotation)
     */
    static async refreshSession(oldRefreshToken: string, ipAddress?: string): Promise<{ accessToken: string, refreshToken: string }> {
        try {
            // 1. Verify token signature
            const decoded = jwt.verify(oldRefreshToken, JWT_REFRESH_SECRET) as any;

            // 2. Check if the token exists in DB and is active
            const session = await prisma.session.findUnique({
                where: { refreshToken: oldRefreshToken },
                include: { user: true }
            });

            if (!session || session.isRevoked || session.expiresAt < new Date()) {
                throw new Error('Invalid or expired refresh token');
            }

            if (!session.user.isActive) {
                throw new Error('User account is inactive');
            }

            // 3. Invalidate old session (Rotation)
            await prisma.session.update({
                where: { id: session.id },
                data: { isRevoked: true }
            });

            // 4. Issue new tokens
            return this.createSession(session.userId, session.deviceInfo || undefined, ipAddress);
        } catch (error) {
            throw new Error('Failed to refresh session');
        }
    }

    /**
     * Invalidate a specific session
     */
    static async revokeSession(refreshToken: string) {
        await prisma.session.updateMany({
            where: { refreshToken },
            data: { isRevoked: true }
        });
    }

    /**
     * Invalidate all user sessions
     */
    static async revokeAllUserSessions(userId: string) {
        await prisma.session.updateMany({
            where: { userId, isRevoked: false },
            data: { isRevoked: true }
        });
    }
}
