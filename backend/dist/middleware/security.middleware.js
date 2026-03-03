"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureSecurity = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const helmet_1 = __importDefault(require("helmet"));
const configureSecurity = (app) => {
    // 1. Helmet for Security Headers
    app.use((0, helmet_1.default)());
    // 2. Rate Limiting (Global)
    const limiter = (0, express_rate_limit_1.default)({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 500, // Limit each IP to 500 requests per windowMs
        standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
        legacyHeaders: false, // Disable the `X-RateLimit-*` headers
        message: { error: 'Too many requests, please try again later.' }
    });
    // Apply to all API routes
    app.use('/api', limiter);
    // 3. Stricter limit for Sensitive Transactions
    const transactionLimiter = (0, express_rate_limit_1.default)({
        windowMs: 60 * 1000, // 1 minute
        max: 5, // Limit each IP to 5 transactions per minute
        message: { error: 'Too many transactions. Please wait a moment.' }
    });
    app.use('/api/wallet/transfer', transactionLimiter);
    app.use('/api/products/purchase', transactionLimiter);
    // 4. Stricter limit for Auth routes
    const authLimiter = (0, express_rate_limit_1.default)({
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 5, // Limit each IP to 5 attempts per hour
        message: { error: 'Too many attempts. Please try again after an hour.' }
    });
    app.use('/api/auth/login', authLimiter);
    app.use('/api/auth/sync', authLimiter);
};
exports.configureSecurity = configureSecurity;
