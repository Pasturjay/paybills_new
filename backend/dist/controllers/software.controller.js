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
exports.verifySoftwarePurchase = exports.purchaseSoftware = void 0;
const transaction_service_1 = require("../services/transaction.service");
const paystack_service_1 = require("../services/paystack.service");
const prisma_1 = __importDefault(require("../prisma"));
const paystackService = new paystack_service_1.PaystackService();
const purchaseSoftware = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const { paymentMethod, items, amount, pin } = req.body;
        console.log('Software Purchase Request:', { userId, paymentMethod, amount, itemsCount: items === null || items === void 0 ? void 0 : items.length });
        // items: [{ itemCode, amount, softwareName, quantity }]
        const user = yield prisma_1.default.user.findUnique({ where: { id: userId } });
        if (!user)
            return res.status(404).json({ success: false, message: 'User not found' });
        // Normalize single purchase to items array if needed (backward compatibility)
        const cartItems = items || [{ itemCode: req.body.itemCode, amount: req.body.amount, softwareName: req.body.softwareName, quantity: 1 }];
        const totalAmount = amount || cartItems.reduce((sum, item) => sum + (item.amount * (item.quantity || 1)), 0);
        // Handle Paystack Payment
        if (paymentMethod === 'PAYSTACK') {
            console.log('Initiating Paystack Transaction:', { email: user.email, totalAmount, paymentMethod });
            if (!user.email) {
                console.error('Paystack Error: User email missing', { userId: user.id });
                return res.status(400).json({ success: false, message: 'Your account email is missing. Please update your profile.' });
            }
            if (!totalAmount || Number(totalAmount) <= 0) {
                console.error('Paystack Error: Invalid Amount', { totalAmount });
                return res.status(400).json({ success: false, message: 'Invalid checkout amount.' });
            }
            const callbackUrl = `${process.env.APP_URL || 'http://localhost:3000'}/dashboard/software/verify`;
            console.log('Callback URL:', callbackUrl);
            const initResponse = yield paystackService.initializeTransaction(user.email, Number(totalAmount), callbackUrl, {
                type: 'software',
                userId: userId,
                cartItems: cartItems
            });
            // Create Pending Transaction (Single transaction for the bulk order)
            yield transaction_service_1.transactionService.initiatePurchase(userId, 'EPIN', Number(totalAmount), {
                subtype: 'SOFTWARE_PURCHASE_BULK',
                items: cartItems,
                description: `Software Purchase (${cartItems.length} items)`,
                paymentMethod: 'PAYSTACK'
            });
            return res.json({
                success: true,
                authorization_url: initResponse.authorization_url,
                reference: initResponse.reference,
                message: 'Redirecting to Paystack...'
            });
        }
        // Wallet Payment Logic
        // 1. Verify PIN
        if (!user.transactionPin || user.transactionPin !== pin) {
            return res.status(400).json({ success: false, message: 'Invalid Transaction PIN' });
        }
        // 2. Process Items & Generate Keys
        const processedItems = [];
        // We will create one parent transaction for the total amount
        const transaction = yield transaction_service_1.transactionService.initiatePurchase(userId, 'EPIN', Number(totalAmount), {
            subtype: 'SOFTWARE_PURCHASE_BULK',
            description: `Software Purchase (${cartItems.length} items)`,
            items: cartItems.map((item) => (Object.assign(Object.assign({}, item), { licenseKey: `XXXX-YYYY-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}` // Generate for each
             })))
        });
        // 3. Complete Transaction immediately
        yield transaction_service_1.transactionService.completeTransaction(transaction.id, 'SUCCESS', {
            reference: `SW-${Date.now()}`,
            message: 'Software Delivered Successfully',
            processedItems: transaction.metadata.items
        });
        res.json({
            success: true,
            message: 'Software purchase successful',
            data: {
                transactionId: transaction.id,
                items: transaction.metadata.items
            }
        });
    }
    catch (error) {
        console.error('Software Purchase Failed:', error);
        res.status(500).json({ success: false, message: error.message || 'Purchase failed' });
    }
});
exports.purchaseSoftware = purchaseSoftware;
const verifySoftwarePurchase = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = req.user.userId;
        const { reference } = req.query;
        if (!reference || typeof reference !== 'string') {
            return res.status(400).json({ success: false, message: 'Transaction reference is required' });
        }
        // 1. Verify with Paystack
        const verification = yield paystackService.verifyTransaction(reference);
        if (verification.status !== 'success') {
            return res.status(400).json({ success: false, message: 'Transaction was not successful' });
        }
        // 2. Check if already processed
        let transaction = yield prisma_1.default.transaction.findFirst({
            where: { reference: reference }
        });
        if (transaction && transaction.status === 'SUCCESS') {
            return res.json({
                success: true,
                message: 'Software already delivered',
                data: {
                    transactionId: transaction.id,
                    items: transaction.metadata.processedItems || transaction.metadata.items
                }
            });
        }
        // 3. Find pending transaction
        if (!transaction) {
            transaction = yield prisma_1.default.transaction.findFirst({
                where: {
                    userId,
                    type: 'EPIN',
                    status: 'PENDING',
                    // Basic match since we didn't store reference in pending tx metadata yet
                },
                orderBy: { createdAt: 'desc' }
            });
        }
        if (!transaction) {
            return res.status(404).json({ success: false, message: 'Pending transaction not found' });
        }
        // 4. Deliver license keys
        const items = ((_a = transaction.metadata) === null || _a === void 0 ? void 0 : _a.items) || [];
        const processedItems = items.map((item) => (Object.assign(Object.assign({}, item), { licenseKey: `PAYSTACK-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}` })));
        yield transaction_service_1.transactionService.completeTransaction(transaction.id, 'SUCCESS', {
            reference: reference,
            message: 'Software Delivered Successfully',
            processedItems
        });
        res.json({
            success: true,
            message: 'Software purchase verified successfully',
            data: {
                transactionId: transaction.id,
                items: processedItems
            }
        });
    }
    catch (error) {
        console.error('Verify Software Error:', error);
        res.status(500).json({ success: false, message: error.message || 'Verification failed' });
    }
});
exports.verifySoftwarePurchase = verifySoftwarePurchase;
