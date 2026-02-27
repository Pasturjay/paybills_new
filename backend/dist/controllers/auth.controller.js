"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = exports.requestOtp = exports.syncFirebaseUser = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Lazy-load firebaseAdmin so startup doesn't crash if service account is missing
const getFirebaseAuth = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { auth } = yield Promise.resolve().then(() => __importStar(require('../config/firebase.config')));
        return auth;
    }
    catch (_a) {
        return null;
    }
});
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_dev_only';
const syncFirebaseUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
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
        const firebaseAuth = yield getFirebaseAuth();
        if (!firebaseAuth) {
            console.error('Sync failed: firebaseAuth is null');
            return res.status(503).json({ error: 'Firebase Admin not configured. Please add your service account.' });
        }
        console.log('Verifying token...');
        const decodedToken = yield firebaseAuth.verifyIdToken(token);
        const { uid, email, name, picture, phone_number } = decodedToken;
        console.log('Token verified for UID:', uid, 'Email:', email);
        // Determine the auth provider
        const signInProvider = (_a = decodedToken.firebase) === null || _a === void 0 ? void 0 : _a.sign_in_provider;
        const authProvider = (signInProvider === null || signInProvider === void 0 ? void 0 : signInProvider.includes('google')) ? 'GOOGLE'
            : (signInProvider === null || signInProvider === void 0 ? void 0 : signInProvider.includes('apple')) ? 'APPLE'
                : signInProvider === 'phone' ? 'PHONE'
                    : 'EMAIL';
        console.log('Provider detected:', authProvider);
        // Parse name into first/last if firstName/lastName not already set
        let firstName = '';
        let lastName = '';
        if (name) {
            const parts = name.trim().split(' ');
            firstName = parts[0] || '';
            lastName = parts.slice(1).join(' ') || '';
        }
        console.log('Searching for user by firebaseUid:', uid);
        let user = yield prisma_1.default.user.findUnique({
            where: { firebaseUid: uid },
        });
        if (!user) {
            console.log('User not found by firebaseUid. Checking fallback email/phone...');
            // Check if a user with the same email/phone exists (migration from old password auth)
            const searchConditions = [];
            if (email)
                searchConditions.push({ email });
            if (phone_number)
                searchConditions.push({ phone: phone_number });
            if (searchConditions.length > 0) {
                console.log('Search conditions:', JSON.stringify(searchConditions));
                user = yield prisma_1.default.user.findFirst({
                    where: { OR: searchConditions }
                });
            }
            if (user) {
                console.log('Found existing user for migration. ID:', user.id);
                // Link Firebase UID to existing account
                user = yield prisma_1.default.user.update({
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
            }
            else {
                console.log('No user found by email/phone. Creating new user...');
                // Create New User
                const baseCode = (firstName || 'USR').substring(0, 3).toUpperCase();
                let referralCode = `${baseCode}${Math.floor(1000 + Math.random() * 9000)}`;
                let isUniqueRC = false;
                while (!isUniqueRC) {
                    const check = yield prisma_1.default.user.findUnique({ where: { referralCode } });
                    if (!check)
                        isUniqueRC = true;
                    else
                        referralCode = `${baseCode}${Math.floor(1000 + Math.random() * 9000)}`;
                }
                console.log('Generated referral code:', referralCode);
                user = yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
                    console.log('Starting DB transaction for new user...');
                    const newUser = yield tx.user.create({
                        data: {
                            email: email || undefined,
                            phone: phone_number ? phone_number : undefined,
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
                    yield tx.wallet.create({
                        data: { userId: newUser.id, currency: 'NGN', balance: 0.00 },
                    });
                    return newUser;
                }));
                console.log('New user created successfully. ID:', user.id);
                // Welcome email (non-blocking)
                if (email) {
                    try {
                        const { EmailService } = yield Promise.resolve().then(() => __importStar(require('../services/email.service')));
                        const emailService = new EmailService();
                        const html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px"><h2 style="color:#4F46E5">Welcome to Paybills.ng, ${firstName || 'there'}!</h2><p>You now have access to fast and easy bill payments, wallet management, airtime, and more.</p><br/><p>Best regards,<br/><strong>The Paybills Team</strong></p></div>`;
                        emailService.sendEmail(email, 'Welcome to Paybills!', `Welcome, ${firstName || 'there'}!`, html, 'Welcome Email')
                            .catch(e => console.error('Non-fatal welcome email error:', e));
                    }
                    catch (e) {
                        console.error('EmailService error:', e);
                    }
                }
            }
        }
        else {
            console.log('Found user by firebaseUid. ID:', user.id);
            // Update existing user login time and profile pic
            user = yield prisma_1.default.user.update({
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
        console.log('Generating platform token...');
        const platformToken = jsonwebtoken_1.default.sign({ id: user.id, uid: user.firebaseUid, role: user.role }, JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1d' });
        return res.json({
            message: 'User synced successfully',
            token: platformToken,
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
    }
    catch (error) {
        console.error('Firebase Auth Sync Error:', error);
        // Handle specific Firebase errors
        if ((_c = (_b = error === null || error === void 0 ? void 0 : error.errorInfo) === null || _b === void 0 ? void 0 : _b.code) === null || _c === void 0 ? void 0 : _c.startsWith('auth/')) {
            return res.status(401).json({
                error: `Authentication Error: ${error.errorInfo.message || error.errorInfo.code}`,
                code: error.errorInfo.code
            });
        }
        // Handle Prisma errors
        if ((_d = error === null || error === void 0 ? void 0 : error.code) === null || _d === void 0 ? void 0 : _d.startsWith('P')) {
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
});
exports.syncFirebaseUser = syncFirebaseUser;
// These are deprecated — kept so existing routes don't 404
const requestOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () { return res.status(410).json({ error: 'Deprecated. Use Firebase sign-in and POST /api/auth/sync.' }); });
exports.requestOtp = requestOtp;
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () { return res.status(410).json({ error: 'Deprecated. Use Firebase sign-in and POST /api/auth/sync.' }); });
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () { return res.status(410).json({ error: 'Deprecated. Use Firebase sign-in and POST /api/auth/sync.' }); });
exports.login = login;
