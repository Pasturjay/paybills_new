import { Request, Response, NextFunction } from 'express';
import { auth } from '../config/firebase.config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Unauthorized: No token provided' });

    try {
        const decodedToken = await auth.verifyIdToken(token);

        // Find existing user in Prisma by firebaseUid or email
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { firebaseUid: decodedToken.uid },
                    { email: decodedToken.email }
                ]
            }
        });

        if (!user) {
            return res.status(401).json({ error: 'Unauthorized: User record mapping not found' });
        }

        // @ts-ignore
        req.user = user;
        next();
    } catch (error) {
        console.error("Firebase token verification failed", error);
        return res.status(403).json({ error: 'Forbidden: Invalid or expired token' });
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
