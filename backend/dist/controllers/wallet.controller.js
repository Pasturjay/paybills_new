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
Object.defineProperty(exports, "__esModule", { value: true });
exports.lookupUser = exports.transferFunds = exports.getVirtualAccount = exports.verifyFunding = exports.initiateFunding = exports.simulateFund = exports.getUserTransactions = exports.getBalance = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const paystack_service_1 = require("../services/paystack.service");
const security_service_1 = require("../services/security.service");
const paystackService = new paystack_service_1.PaystackService();
const securityService = new security_service_1.SecurityService();
// Get Wallet Balance
const getBalance = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // @ts-ignore - UserId attached by auth middleware
        const userId = req.user.userId;
        const wallet = yield prisma.wallet.findFirst({
            where: { userId, currency: 'NGN' },
        });
        if (!wallet) {
            return res.status(404).json({ error: 'Wallet not found' });
        }
        res.json({ balance: wallet.balance, currency: wallet.currency });
    }
    catch (error) {
        console.error('Get Balance Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
exports.getBalance = getBalance;
// Get User Transactions
const getUserTransactions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const transactions = yield prisma.transaction.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50 // Limit to last 50 for now
        });
        res.json(transactions);
    }
    catch (error) {
        console.error('Get Transactions Error:', error);
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
});
exports.getUserTransactions = getUserTransactions;
// Simulate Funding (In prod, this would be a webhook callback)
const simulateFund = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // @ts-ignore
        const userId = req.user.userId;
        const { amount } = req.body;
        // Check KYC Level
        const user = yield prisma.user.findUnique({ where: { id: userId } });
        if (!user || user.kycLevel < 1) {
            return res.status(403).json({ error: 'Identity verification required. Please verify your NIN to fund your wallet.' });
        }
        const updatedWallet = yield prisma.wallet.updateMany({
            where: { userId, currency: 'NGN' },
            data: {
                balance: { increment: Number(amount) }
            }
        });
        // In a real app, create a Transaction and LedgerEntry here too
        yield prisma.transaction.create({
            data: {
                userId,
                walletId: ((_a = (yield prisma.wallet.findFirst({ where: { userId } }))) === null || _a === void 0 ? void 0 : _a.id) || '',
                amount: Number(amount),
                total: Number(amount),
                type: 'FUNDING',
                status: 'SUCCESS',
                reference: 'FUND_' + Date.now()
            }
        });
        // Send Notification
        const { notificationService } = yield Promise.resolve().then(() => __importStar(require('../services/notification.service')));
        yield notificationService.createNotification(userId, 'Wallet Funded', `Your wallet has been funded with ₦${amount}`, 'SUCCESS');
        res.json({ message: 'Wallet funded successfully', amount });
    }
    catch (error) {
        res.status(500).json({ error: 'Funding Error' });
    }
});
exports.simulateFund = simulateFund;
const initiateFunding = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // @ts-ignore
        const userId = req.user.userId;
        const { amount } = req.body;
        if (!amount || Number(amount) <= 0) {
            return res.status(400).json({ error: 'Invalid amount' });
        }
        const user = yield prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        // callback URL - frontend verification page
        // Use process.env.FRONTEND_URL usually, hardcoding for now based on user context if needed, or relative.
        // Assuming localhost or the deployed URL.
        const callbackUrl = `${process.env.APP_URL || 'http://localhost:3000'}/dashboard/fund/verify`;
        if (!user.email)
            return res.status(400).json({ error: 'Email address required to fund wallet. Please update your profile.' });
        const initResponse = yield paystackService.initializeTransaction(user.email, Number(amount), callbackUrl, {
            type: 'funding',
            userId: userId
        });
        res.json({
            message: 'Authorization URL created',
            authorization_url: initResponse.authorization_url,
            reference: initResponse.reference
        });
    }
    catch (error) {
        console.error('Initiate Funding Error:', error);
        res.status(500).json({ error: error.message || 'Failed to initiate funding' });
    }
});
exports.initiateFunding = initiateFunding;
const verifyFunding = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // @ts-ignore
        const userId = req.user.userId;
        const { reference } = req.query;
        if (!reference || typeof reference !== 'string') {
            return res.status(400).json({ error: 'Transaction reference is required' });
        }
        // 1. Verify with Paystack
        const verification = yield paystackService.verifyTransaction(reference);
        if (verification.status !== 'success') {
            return res.status(400).json({ error: 'Transaction was not successful' });
        }
        // 2. Check if transaction already processed
        const existingTx = yield prisma.transaction.findFirst({
            where: { reference: reference }
        });
        if (existingTx) {
            return res.json({ message: 'Transaction already processed', status: existingTx.status });
        }
        // 3. Fund Wallet
        const amount = verification.amount / 100; // Convert kobo to naira
        const wallet = yield prisma.wallet.findFirst({ where: { userId, currency: 'NGN' } });
        if (!wallet)
            return res.status(404).json({ error: 'Wallet not found' });
        yield prisma.$transaction([
            prisma.wallet.update({
                where: { id: wallet.id },
                data: { balance: { increment: amount } }
            }),
            prisma.transaction.create({
                data: {
                    userId,
                    walletId: wallet.id,
                    amount: amount,
                    total: amount,
                    type: 'FUNDING',
                    status: 'SUCCESS',
                    reference: reference,
                    metadata: JSON.stringify(verification)
                }
            })
        ]);
        // 4. Notify
        const { notificationService } = yield Promise.resolve().then(() => __importStar(require('../services/notification.service')));
        yield notificationService.createNotification(userId, 'Wallet Funded', `Your wallet has been funded with ₦${amount.toLocaleString()}`, 'SUCCESS');
        res.json({ message: 'Wallet funded successfully', amount });
    }
    catch (error) {
        console.error('Verify Funding Error:', error);
        res.status(500).json({ error: error.message || 'Verification failed' });
    }
});
exports.verifyFunding = verifyFunding;
const flutterwave_service_1 = require("../services/flutterwave.service");
const flutterwaveService = new flutterwave_service_1.FlutterwaveService();
const getVirtualAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // @ts-ignore
        const userId = req.user.userId;
        const provider = ((_a = req.query.provider) === null || _a === void 0 ? void 0 : _a.toUpperCase()) || 'PAYSTACK'; // Default to Paystack
        // 1. Check if exists in DB for this provider
        const existingAccount = yield prisma.virtualAccount.findFirst({
            where: { userId, provider }
        });
        if (existingAccount) {
            return res.json(existingAccount);
        }
        // 2. Fetch User details for creation
        const user = yield prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        // Basic validation for creation
        if (!user.firstName || !user.lastName || !user.phone) {
            return res.status(400).json({ error: 'Please update your profile name and phone number to generate an account.' });
        }
        let newAccountData;
        if (provider === 'FLUTTERWAVE') {
            // Flutterwave requires BVN usually. Check checks.
            if (!user.bvn) {
                return res.status(400).json({ error: 'BVN is required to generate a Flutterwave Virtual Account. Please complete KYC.' });
            }
            const txRef = `VA-${userId}-${Date.now()}`;
            if (!user.email)
                return res.status(400).json({ error: 'Email address required to create virtual account. Please update your profile.' });
            const flwAccount = yield flutterwaveService.createVirtualAccount(user.email, user.bvn, txRef, user.firstName, user.lastName, user.phone);
            newAccountData = {
                userId,
                bankName: flwAccount.bank_name,
                accountNumber: flwAccount.account_number,
                accountName: `${user.firstName} ${user.lastName}`, // Sometimes flw doesn't return name in data, strictly
                currency: 'NGN',
                provider: 'FLUTTERWAVE',
                providerRef: flwAccount.order_ref
            };
        }
        else {
            // PAYSTACK Logic
            if (!user.email)
                return res.status(400).json({ error: 'Email address required to create virtual account. Please update your profile.' });
            const paystackAccount = yield paystackService.createDedicatedAccount(user.email, user.firstName, user.lastName, user.phone);
            // Adjusting based on standard Paystack DVA response which might be nested
            // Typically: { bank: { name, ... }, account_number, account_name, ... }
            newAccountData = {
                userId,
                bankName: paystackAccount.bank.name,
                accountNumber: paystackAccount.account_number,
                accountName: paystackAccount.account_name,
                currency: paystackAccount.currency || 'NGN',
                provider: 'PAYSTACK',
                providerRef: String(paystackAccount.id)
            };
        }
        // 4. Save to DB
        const newAccount = yield prisma.virtualAccount.create({
            data: newAccountData
        });
        res.json(newAccount);
    }
    catch (error) {
        console.error('Get Virtual Account Error:', error);
        res.status(500).json({ error: error.message || 'Failed to retrieve virtual account' });
    }
});
exports.getVirtualAccount = getVirtualAccount;
const transferFunds = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // @ts-ignore
        const userId = req.user.userId;
        const { recipientEmail, recipientPhone, amount, pin, description } = req.body;
        if (!amount || Number(amount) <= 0) {
            return res.status(400).json({ error: 'Invalid amount' });
        }
        // 1. Verify PIN
        yield securityService.validateRequestPin(userId, pin);
        // 2. Find Recipient
        let recipient;
        if (recipientEmail) {
            recipient = yield prisma.user.findUnique({ where: { email: recipientEmail } });
        }
        else if (recipientPhone) {
            recipient = yield prisma.user.findUnique({ where: { phone: recipientPhone } });
        }
        else if (req.body.recipientTag) {
            let tag = req.body.recipientTag;
            if (!tag.startsWith('@'))
                tag = '@' + tag; // Normalize tag
            recipient = yield prisma.user.findUnique({ where: { userTag: tag } });
        }
        if (!recipient) {
            return res.status(404).json({ error: 'Recipient not found' });
        }
        if (recipient.id === userId) {
            return res.status(400).json({ error: 'Cannot transfer to yourself' });
        }
        // 3. Perform Atomic Transfer
        yield prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            // Check Sender Balance (Locking row if needed, but atomic increment/decrement is usually safe enough for this scale)
            // Ideally we check balance first
            const senderWallet = yield tx.wallet.findFirst({ where: { userId, currency: 'NGN' } });
            if (!senderWallet || senderWallet.balance.toNumber() < Number(amount)) {
                throw new Error('Insufficient funds');
            }
            // Deduct from Sender
            yield tx.wallet.update({
                where: { id: senderWallet.id },
                data: { balance: { decrement: Number(amount) } }
            });
            // Add to Recipient
            const recipientWallet = yield tx.wallet.findFirst({ where: { userId: recipient.id, currency: 'NGN' } });
            if (!recipientWallet) {
                // Should exist, but handle edge case
                throw new Error('Recipient wallet not found'); // Or create one
            }
            yield tx.wallet.update({
                where: { id: recipientWallet.id },
                data: { balance: { increment: Number(amount) } }
            });
            // Create Transaction Records
            const ref = 'TRF_' + Date.now() + Math.floor(Math.random() * 1000);
            // Sender Transaction
            yield tx.transaction.create({
                data: {
                    userId,
                    walletId: senderWallet.id,
                    amount: Number(amount),
                    total: Number(amount),
                    type: 'P2P_TRANSFER',
                    status: 'SUCCESS',
                    reference: ref + '_DR',
                    metadata: JSON.stringify({ recipientId: recipient.id, recipientName: `${recipient.firstName} ${recipient.lastName}` }),
                    description: description || 'Transfer to ' + recipient.firstName
                } // Using as any to bypass partial type mismatches if schema not fully synced in IDE
            });
            // Recipient Transaction
            yield tx.transaction.create({
                data: {
                    userId: recipient.id,
                    walletId: recipientWallet.id,
                    amount: Number(amount),
                    total: Number(amount),
                    type: 'P2P_TRANSFER',
                    status: 'SUCCESS',
                    reference: ref + '_CR',
                    metadata: JSON.stringify({ senderId: userId }),
                    description: description || 'Transfer from ' + ((_a = (yield tx.user.findUnique({ where: { id: userId } }))) === null || _a === void 0 ? void 0 : _a.firstName)
                }
            });
        }));
        // 4. Notify
        const { notificationService } = yield Promise.resolve().then(() => __importStar(require('../services/notification.service')));
        yield notificationService.createNotification(userId, 'Transfer Successful', `You sent ₦${amount} to ${recipient.firstName}`, 'SUCCESS');
        yield notificationService.createNotification(recipient.id, 'Money Received', `You received ₦${amount}`, 'SUCCESS');
        res.json({ message: 'Transfer successful' });
    }
    catch (error) {
        console.error('Transfer Error:', error);
        res.status(400).json({ error: error.message || 'Transfer failed' });
    }
});
exports.transferFunds = transferFunds;
const lookupUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { query } = req.body;
        if (!query) {
            return res.status(400).json({ error: 'Query is required' });
        }
        let searchCriteria = {};
        if (query.startsWith('@')) {
            searchCriteria.userTag = query;
        }
        else if (query.includes('@')) {
            searchCriteria.email = query;
        }
        else {
            searchCriteria.phone = query;
        }
        const user = yield prisma.user.findFirst({
            where: searchCriteria,
            select: {
                id: true,
                firstName: true,
                lastName: true,
                userTag: true,
            }
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User',
            userTag: user.userTag
        });
    }
    catch (error) {
        console.error('Lookup Error:', error);
        res.status(500).json({ error: 'Lookup failed' });
    }
});
exports.lookupUser = lookupUser;
