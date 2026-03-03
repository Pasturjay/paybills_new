import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { Express, Application } from 'express';

export const configureSecurity = (app: Application) => {
    // 1. Helmet for Security Headers
    app.use(helmet());

    // 2. Rate Limiting (Global)
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 500, // Limit each IP to 500 requests per windowMs
        standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
        legacyHeaders: false, // Disable the `X-RateLimit-*` headers
        message: { error: 'Too many requests, please try again later.' }
    });

    // Apply to all API routes
    app.use('/api', limiter);

    // 3. Stricter limit for Sensitive Transactions
    const transactionLimiter = rateLimit({
        windowMs: 60 * 1000, // 1 minute
        max: 5, // Limit each IP to 5 transactions per minute
        message: { error: 'Too many transactions. Please wait a moment.' }
    });
    app.use('/api/wallet/transfer', transactionLimiter);
    app.use('/api/products/purchase', transactionLimiter);

    // 4. Stricter limit for Auth routes
    const authLimiter = rateLimit({
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 5, // Limit each IP to 5 attempts per hour
        message: { error: 'Too many attempts. Please try again after an hour.' }
    });
    app.use('/api/auth/login', authLimiter);
    app.use('/api/auth/sync', authLimiter);

    // 5. Rate limit for Partner Auth
    const partnerAuthLimiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 10, // 10 attempts per 15 minutes
        message: { error: 'Too many partner auth attempts. Please try again later.' }
    });
    app.use('/api/partner/auth', partnerAuthLimiter);
};
