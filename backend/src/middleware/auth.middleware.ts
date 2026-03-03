import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';

const JWT_SECRET = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;

if (!JWT_SECRET) {
    console.error('FATAL: JWT_SECRET environment variable is not set!');
    // In production, we want the process to fail early if security config is missing
    if (process.env.NODE_ENV === 'production') {
        process.exit(1);
    }
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let token = null;

        // 1. Check cookies first (HttpOnly)
        // If cookie-parser is used, req.cookies.accessToken would be available.
        // Doing manual regex fallback in case it's not.
        const cookies = req.headers.cookie;
        if (cookies) {
            const tokenMatch = cookies.match(/accessToken=([^;]+)/);
            if (tokenMatch) {
                token = tokenMatch[1];
            }
        }

        // 2. Check Authorization Header as fallback
        if (!token) {
            const authHeader = req.headers['authorization'];
            token = authHeader && authHeader.split(' ')[1];
        }

        if (!token) return res.status(401).json({ error: 'Unauthorized: No token provided' });

        const decoded = jwt.verify(token, JWT_SECRET) as any;

        const user = await prisma.user.findUnique({
            where: { id: decoded.id }
        });

        if (!user || !user.isActive) {
            return res.status(401).json({ error: 'Unauthorized: User account is inactive or not found' });
        }

        // @ts-ignore
        req.user = { ...user, userId: user.id };
        next();
    } catch (error) {
        console.error("JWT verification failed", error);
        return res.status(403).json({ error: 'Forbidden: Invalid or expired session' });
    }
};

export const authorizeRole = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        // @ts-ignore
        const userRole = req.user?.role;

        if (!userRole) {
            return res.status(401).json({ error: 'Unauthorized: Role missing from payload' });
        }

        if (!roles.includes(userRole)) {
            return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
        }

        next();
    };
};
