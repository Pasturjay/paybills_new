import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_dev_only';

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Unauthorized: No token provided' });

    try {
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

export const authorizeRole = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        // @ts-ignore
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
        }
        next();
    };
};
