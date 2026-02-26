"use strict";
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
exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("Register Request Body:", req.body);
        const { email, phone, password, firstName, lastName } = req.body;
        // Check if user exists
        const existingUser = yield prisma.user.findFirst({
            where: {
                OR: [{ email }, { phone }],
            },
        });
        if (existingUser) {
            return res.status(400).json({ error: 'User with this email or phone already exists' });
        }
        // Hash password
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        // Generate Referral Code (Simple)
        const baseCode = (firstName || 'USER').substring(0, 3).toUpperCase();
        const rand = Math.floor(1000 + Math.random() * 9000);
        let referralCode = `${baseCode}${rand}`;
        // Ensure uniqueness for referralCode
        let isUniqueRC = false;
        while (!isUniqueRC) {
            // @ts-ignore
            const check = yield prisma.user.findUnique({ where: { referralCode } });
            if (!check)
                isUniqueRC = true;
            else
                referralCode = `${baseCode}${Math.floor(1000 + Math.random() * 9000)}`;
        }
        // User Tag (P2P)
        /*
        const baseTag = (firstName || 'User').replace(/\s/g, '');
        let userTag = `@${baseTag}${Math.floor(100 + Math.random() * 900)}`;
        let isUniqueTag = false;
        while (!isUniqueTag) {
            // @ts-ignore
            const check = await prisma.user.findUnique({ where: { userTag } });
            if (!check) isUniqueTag = true;
            else userTag = `@${baseTag}${Math.floor(100 + Math.random() * 9000)}`;
        }
        */
        // Resolve Referrer
        let referrerId = null;
        if (req.body.referralCode) {
            // @ts-ignore
            const referrer = yield prisma.user.findUnique({ where: { referralCode: req.body.referralCode } });
            if (referrer)
                referrerId = referrer.id;
        }
        // Create User and Initial Wallet (Atomic Transaction)
        const result = yield prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const user = yield tx.user.create({
                data: {
                    email,
                    phone,
                    password: hashedPassword,
                    firstName,
                    lastName,
                    referralCode,
                    // userTag,
                    referredById: referrerId
                },
            });
            // Create NGN Wallet
            yield tx.wallet.create({
                data: {
                    userId: user.id,
                    currency: 'NGN',
                    balance: 500000.00,
                },
            });
            return user;
        }));
        res.status(201).json({ message: 'User registered successfully', userId: result.id });
    }
    catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("Login Request Body:", req.body);
        const { email, password } = req.body;
        // Allow login with Email OR Phone
        const user = yield prisma.user.findFirst({
            where: {
                OR: [
                    { email: email },
                    { phone: email } // inferred from input
                ]
            }
        });
        if (!user || !(yield bcryptjs_1.default.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is not defined");
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, user: { id: user.id, email: user.email, firstName: user.firstName, role: user.role } });
    }
    catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
exports.login = login;
