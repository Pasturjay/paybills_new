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

    // Stricter limit for Auth routes
    const authLimiter = rateLimit({
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 10, // Limit each IP to 5 create account requests per hour
        message: { error: 'Too many login attempts, please try again after an hour' }
    });
    app.use('/api/auth/login', authLimiter);
};
