import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const PARTNER_JWT_SECRET = process.env.PARTNER_JWT_SECRET || 'fallback_partner_secret';

export const partnerAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Unauthorized: Partner token required' });
        }

        // Verify Partner Token (Using separate secret from User JWT)
        const decoded = jwt.verify(token, PARTNER_JWT_SECRET) as any;

        if (!decoded || !decoded.partnerId) {
            return res.status(401).json({ error: 'Unauthorized: Invalid Partner token' });
        }

        // @ts-ignore Attach partner payload to request
        req.partner = decoded;

        next();
    } catch (error: any) {
        console.error('Partner Auth Middleware Error:', error.message);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Unauthorized: Partner token expired' });
        }
        return res.status(403).json({ error: 'Forbidden: Invalid Partner token' });
    }
};
