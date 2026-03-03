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
Object.defineProperty(exports, "__esModule", { value: true });
exports.lookupUser = exports.transferFunds = exports.getVirtualAccount = exports.verifyFunding = exports.initiateFunding = exports.simulateFund = exports.getUserTransactions = exports.getBalance = void 0;
const client_1 = require("@prisma/client");
const socket_service_1 = require("../services/socket.service");
const prisma = new client_1.PrismaClient();
const paystack_service_1 = require("../services/paystack.service");
const security_service_1 = require("../services/security.service");
const paystackService = new paystack_service_1.PaystackService();
const securityService = new security_service_1.SecurityService();
// Get Wallet Balance
const getBalance = async (req, res) => {
    try {
        // @ts-ignore - UserId attached by auth middleware
        const userId = req.user.id;
        const wallet = await prisma.wallet.findFirst({
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
};
exports.getBalance = getBalance;
// Get User Transactions
const getUserTransactions = async (req, res) => {
    try {
        const userId = req.user.id;
        const transactions = await prisma.transaction.findMany({
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
};
exports.getUserTransactions = getUserTransactions;
// Simulate Funding (In prod, this would be a webhook callback)
const simulateFund = async (req, res) => {
    var _a;
    try {
        // @ts-ignore
        const userId = req.user.id;
        const { amount } = req.body;
        // Check KYC Level
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || user.kycLevel < 1) {
            return res.status(403).json({ error: 'Identity verification required. Please verify your NIN to fund your wallet.' });
        }
        const updatedWallet = await prisma.wallet.updateMany({
            where: { userId, currency: 'NGN' },
            data: {
                balance: { increment: Number(amount) }
            }
        });
        // In a real app, create a Transaction and LedgerEntry here too
        await prisma.transaction.create({
            data: {
                userId,
                walletId: ((_a = (await prisma.wallet.findFirst({ where: { userId } }))) === null || _a === void 0 ? void 0 : _a.id) || '',
                amount: Number(amount),
                total: Number(amount),
                type: 'FUNDING',
                status: 'SUCCESS',
                reference: 'FUND_' + Date.now()
            }
        });
        // Send Notification
        const { notificationService } = await Promise.resolve().then(() => __importStar(require('../services/notification.service')));
        await notificationService.createNotification(userId, 'Wallet Topped Up', `Your wallet has been topped up with ₦${amount}`, 'SUCCESS');
        res.json({ message: 'Wallet funded successfully', amount });
    }
    catch (error) {
        res.status(500).json({ error: 'Funding Error' });
    }
};
exports.simulateFund = simulateFund;
const initiateFunding = async (req, res) => {
    try {
        // @ts-ignore
        const userId = req.user.id;
        const { amount } = req.body;
        if (!amount || Number(amount) <= 0) {
            return res.status(400).json({ error: 'Invalid amount' });
        }
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        // callback URL - frontend verification page
        // Use process.env.FRONTEND_URL usually, hardcoding for now based on user context if needed, or relative.
        // Assuming localhost or the deployed URL.
        const callbackUrl = `${process.env.APP_URL || 'http://localhost:3000'}/dashboard/fund/verify`;
        if (!user.email)
            return res.status(400).json({ error: 'Email address required to fund wallet. Please update your profile.' });
        const initResponse = await paystackService.initializeTransaction(user.email, Number(amount), callbackUrl, {
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
};
exports.initiateFunding = initiateFunding;
const verifyFunding = async (req, res) => {
    try {
        // @ts-ignore
        const userId = req.user.id;
        const { reference } = req.query;
        if (!reference || typeof reference !== 'string') {
            return res.status(400).json({ error: 'Transaction reference is required' });
        }
        // 1. Verify with Paystack
        const verification = await paystackService.verifyTransaction(reference);
        if (verification.status !== 'success') {
            return res.status(400).json({ error: 'Transaction was not successful' });
        }
        // 2. Check if transaction already processed
        const existingTx = await prisma.transaction.findFirst({
            where: { reference: reference }
        });
        if (existingTx) {
            return res.json({ message: 'Transaction already processed', status: existingTx.status });
        }
        // 3. Fund Wallet
        const amount = verification.amount / 100; // Convert kobo to naira
        await prisma.$transaction(async (tx) => {
            // Get Wallet with row-level lock
            const wallets = await tx.$queryRaw(client_1.Prisma.sql `SELECT * FROM "Wallet" WHERE "userId" = ${userId} AND "currency" = 'NGN' FOR UPDATE`);
            const wallet = wallets[0];
            if (!wallet)
                throw new Error('Wallet not found');
            await tx.wallet.update({
                where: { id: wallet.id },
                data: { balance: { increment: amount } }
            });
            await tx.transaction.create({
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
            });
        });
        // Emit Real-time update
        const wallet = await prisma.wallet.findFirst({ where: { userId, currency: 'NGN' } });
        if (wallet) {
            socket_service_1.socketService.emitToUser(userId, 'BALANCE_UPDATE', { balance: wallet.balance });
        }
        socket_service_1.socketService.emitToUser(userId, 'TRANSACTION_NEW', {
            id: 'REF_' + Date.now(),
            type: 'FUNDING',
            amount,
            status: 'SUCCESS',
            message: 'Wallet topped up successfully'
        });
        res.json({ message: 'Wallet topped up successfully', amount });
    }
    catch (error) {
        console.error('Verify Funding Error:', error);
        res.status(500).json({ error: error.message || 'Verification failed' });
    }
};
exports.verifyFunding = verifyFunding;
const flutterwave_service_1 = require("../services/flutterwave.service");
const flutterwaveService = new flutterwave_service_1.FlutterwaveService();
const getVirtualAccount = async (req, res) => {
    var _a, _b, _c, _d, _e;
    // @ts-ignore
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const provider = ((_b = req.query.provider) === null || _b === void 0 ? void 0 : _b.toUpperCase()) || 'PAYSTACK';
    try {
        // 1. Check if exists in DB for this provider
        const existingAccount = await prisma.virtualAccount.findFirst({
            where: { userId, provider }
        });
        if (existingAccount) {
            return res.json(existingAccount);
        }
        // 2. Fetch User details for creation
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        // Basic validation for creation
        if (!user.firstName || !user.lastName || !user.phone) {
            return res.status(400).json({
                error: 'Profile incomplete',
                code: 'MISSING_PROFILE_INFO',
                missingFields: {
                    firstName: !user.firstName,
                    lastName: !user.lastName,
                    phone: !user.phone
                }
            });
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
            const flwAccount = await flutterwaveService.createVirtualAccount(user.email, user.bvn, txRef, user.firstName, user.lastName, user.phone);
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
            const paystackAccount = await paystackService.createDedicatedAccount(user.email, user.firstName, user.lastName, user.phone);
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
        const newAccount = await prisma.virtualAccount.create({
            data: newAccountData
        });
        res.json(newAccount);
    }
    catch (error) {
        console.error('Get Virtual Account Error:', {
            userId,
            provider,
            message: error.message,
            response: (_c = error.response) === null || _c === void 0 ? void 0 : _c.data
        });
        res.status(500).json({
            error: ((_e = (_d = error.response) === null || _d === void 0 ? void 0 : _d.data) === null || _e === void 0 ? void 0 : _e.message) || error.message || 'Failed to retrieve virtual account'
        });
    }
};
exports.getVirtualAccount = getVirtualAccount;
const transferFunds = async (req, res) => {
    try {
        // @ts-ignore
        const userId = req.user.id;
        const { recipientEmail, recipientPhone, amount, pin, description, idempotencyKey } = req.body;
        if (!amount || Number(amount) <= 0) {
            return res.status(400).json({ error: 'Invalid amount' });
        }
        // 1. Verify PIN
        await securityService.validateRequestPin(userId, pin);
        // 1.1 Check for Idempotency
        if (idempotencyKey) {
            const existingDR = await prisma.transaction.findFirst({
                where: { userId, idempotencyKey }
            });
            if (existingDR) {
                return res.json({
                    success: true,
                    message: 'Transfer already processed',
                    reference: existingDR.reference,
                    amount: existingDR.amount
                });
            }
        }
        // 2. Find Recipient
        let recipient;
        if (recipientEmail) {
            recipient = await prisma.user.findUnique({ where: { email: recipientEmail } });
        }
        else if (recipientPhone) {
            recipient = await prisma.user.findUnique({ where: { phone: recipientPhone } });
        }
        else if (req.body.recipientTag) {
            let tag = req.body.recipientTag;
            if (!tag.startsWith('@'))
                tag = '@' + tag; // Normalize tag
            recipient = await prisma.user.findFirst({
                where: {
                    userTag: { equals: tag, mode: 'insensitive' }
                }
            });
        }
        if (!recipient) {
            return res.status(404).json({ error: 'Recipient not found' });
        }
        if (recipient.id === userId) {
            return res.status(400).json({ error: 'Cannot transfer to yourself' });
        }
        // 3. Perform Atomic Transfer
        await prisma.$transaction(async (tx) => {
            // Check Sender Balance with row-level lock
            const senderWallets = await tx.$queryRaw(client_1.Prisma.sql `SELECT * FROM "Wallet" WHERE "userId" = ${userId} AND "currency" = 'NGN' FOR UPDATE`);
            const senderWallet = senderWallets[0];
            if (!senderWallet || Number(senderWallet.balance) < Number(amount)) {
                throw new Error('Insufficient funds');
            }
            // Get Recipient Wallet with row-level lock
            const recipientWallets = await tx.$queryRaw(client_1.Prisma.sql `SELECT * FROM "Wallet" WHERE "userId" = ${recipient.id} AND "currency" = 'NGN' FOR UPDATE`);
            const recipientWallet = recipientWallets[0];
            if (!recipientWallet) {
                throw new Error('Recipient wallet not found');
            }
            // Deduct from Sender
            await tx.wallet.update({
                where: { id: senderWallet.id },
                data: { balance: { decrement: Number(amount) } }
            });
            // Add to Recipient
            await tx.wallet.update({
                where: { id: recipientWallet.id },
                data: { balance: { increment: Number(amount) } }
            });
            // Create Transaction Records
            const ref = 'TRF_' + Date.now() + Math.floor(Math.random() * 1000);
            const sender = await tx.user.findUnique({ where: { id: userId } });
            // Sender Transaction (Debit)
            await tx.transaction.create({
                data: {
                    userId,
                    walletId: senderWallet.id,
                    amount: Number(amount),
                    total: Number(amount),
                    type: 'P2P_TRANSFER',
                    status: 'SUCCESS',
                    reference: ref + '_DR',
                    idempotencyKey,
                    metadata: {
                        recipientId: recipient.id,
                        recipientName: `${recipient.firstName} ${recipient.lastName}`,
                        recipientTag: recipient.userTag
                    },
                    description: description || `Gift to ${recipient.firstName} ${recipient.lastName}`
                }
            });
            // Recipient Transaction (Credit)
            await tx.transaction.create({
                data: {
                    userId: recipient.id,
                    walletId: recipientWallet.id,
                    amount: Number(amount),
                    total: Number(amount),
                    type: 'P2P_TRANSFER',
                    status: 'SUCCESS',
                    reference: ref + '_CR',
                    metadata: {
                        senderId: userId,
                        senderName: `${sender === null || sender === void 0 ? void 0 : sender.firstName} ${sender === null || sender === void 0 ? void 0 : sender.lastName}`,
                        senderTag: sender === null || sender === void 0 ? void 0 : sender.userTag
                    },
                    description: description || `Gift from ${sender === null || sender === void 0 ? void 0 : sender.firstName} ${sender === null || sender === void 0 ? void 0 : sender.lastName}`
                }
            });
        });
        // Emit Real-time updates
        const senderWallet = await prisma.wallet.findFirst({ where: { userId, currency: 'NGN' } });
        const receiverWallet = await prisma.wallet.findFirst({ where: { id: recipient.id, currency: 'NGN' } });
        if (senderWallet)
            socket_service_1.socketService.emitToUser(userId, 'BALANCE_UPDATE', { balance: senderWallet.balance });
        socket_service_1.socketService.emitToUser(recipient.id, 'BALANCE_UPDATE', { balance: receiverWallet === null || receiverWallet === void 0 ? void 0 : receiverWallet.balance });
        socket_service_1.socketService.emitToUser(userId, 'TRANSACTION_NEW', {
            id: 'TXN_' + Date.now(),
            type: 'TRANSFER',
            amount,
            status: 'SUCCESS',
            message: `Transfer to ${recipient.firstName} successful`
        });
        socket_service_1.socketService.emitToUser(recipient.id, 'TRANSACTION_NEW', {
            id: 'TXN_' + Date.now(),
            type: 'CREDIT',
            amount,
            status: 'SUCCESS',
            message: `You received a gift of ₦${amount}`
        });
        res.json({ message: 'Transfer successful' });
    }
    catch (error) {
        console.error('Transfer Error:', error);
        res.status(400).json({ error: error.message || 'Transfer failed' });
    }
};
exports.transferFunds = transferFunds;
const lookupUser = async (req, res) => {
    try {
        const { query } = req.body;
        if (!query) {
            return res.status(400).json({ error: 'Query is required' });
        }
        let searchCriteria = {};
        const normalizedQuery = query.trim();
        if (normalizedQuery.startsWith('@')) {
            searchCriteria.userTag = { equals: normalizedQuery, mode: 'insensitive' };
        }
        else if (normalizedQuery.includes('@')) {
            searchCriteria.email = { equals: normalizedQuery, mode: 'insensitive' };
        }
        else {
            // Remove any non-numeric characters for phone lookup
            const phoneDigits = normalizedQuery.replace(/\D/g, '');
            searchCriteria.phone = { contains: phoneDigits };
        }
        const user = await prisma.user.findFirst({
            where: searchCriteria,
            select: {
                id: true,
                firstName: true,
                lastName: true,
                userTag: true,
                email: true,
                phone: true
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
};
exports.lookupUser = lookupUser;
