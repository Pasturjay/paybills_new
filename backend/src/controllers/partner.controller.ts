import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';

const PARTNER_JWT_SECRET = process.env.PARTNER_JWT_SECRET || 'fallback_partner_secret';
const PARTNER_JWT_EXPIRES = process.env.PARTNER_JWT_EXPIRES || '30m'; // Short-lived

export class PartnerController {
    /**
     * Authenticate a Partner API Client
     * POST /api/partner/auth
     */
    static async authenticate(req: Request, res: Response) {
        try {
            const { apiKey, apiSecret } = req.body;

            if (!apiKey || !apiSecret) {
                return res.status(400).json({ error: 'Missing apiKey or apiSecret' });
            }

            // 1. Fetch partner by API Key
            const partner = await prisma.partner.findUnique({
                where: { apiKey }
            });

            if (!partner) {
                return res.status(401).json({ error: 'Invalid API Key or Secret' });
            }

            // 2. Validate Partner Status
            if (partner.status !== 'ACTIVE') {
                return res.status(403).json({ error: 'Partner account is suspended' });
            }

            // 3. Optional IP Whitelisting
            const clientIp = req.ip || req.headers['x-forwarded-for'] as string;
            if (partner.allowedIPs && partner.allowedIPs.length > 0) {
                if (!partner.allowedIPs.includes(clientIp)) {
                    console.warn(`Partner ${partner.name} access denied from IP: ${clientIp}`);
                    return res.status(403).json({ error: 'Unauthorized IP Address' });
                }
            }

            // 4. Verify Secret
            const isMatch = await bcrypt.compare(apiSecret, partner.apiSecret);
            if (!isMatch) {
                return res.status(401).json({ error: 'Invalid API Key or Secret' });
            }

            // 5. Issue Partner JWT
            const partnerToken = jwt.sign(
                { partnerId: partner.id, name: partner.name, rateLimit: partner.rateLimit },
                PARTNER_JWT_SECRET,
                { expiresIn: PARTNER_JWT_EXPIRES as any }
            );

            res.json({
                message: 'Partner authenticated successfully',
                token: partnerToken,
                expiresIn: PARTNER_JWT_EXPIRES
            });

        } catch (error: any) {
            console.error('Partner Auth Error:', error);
            res.status(500).json({ error: 'Internal server error during partner authentication' });
        }
    }
}
