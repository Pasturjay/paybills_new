"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifySoftwarePurchase = exports.purchaseSoftware = exports.bulkUploadSoftware = exports.deleteSoftwareProduct = exports.updateSoftwareProduct = exports.createSoftwareProduct = exports.getSoftwareProducts = void 0;
const transaction_service_1 = require("../services/transaction.service");
const paystack_service_1 = require("../services/paystack.service");
const prisma_1 = __importDefault(require("../prisma"));
const paystackService = new paystack_service_1.PaystackService();
const getSoftwareProducts = async (req, res) => {
    try {
        const { category, search, page = 1, limit = 50, admin = false } = req.query;
        const pageNumber = Number(page);
        const limitNumber = Number(limit);
        const where = {};
        // If not admin, only show active products
        if (!admin) {
            where.isActive = true;
        }
        if (category && category !== 'All') {
            where.category = category;
        }
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { brand: { contains: search, mode: 'insensitive' } }
            ];
        }
        const [total, products] = await Promise.all([
            prisma_1.default.softwareProduct.count({ where }),
            prisma_1.default.softwareProduct.findMany({
                where,
                skip: (pageNumber - 1) * limitNumber,
                take: limitNumber,
                orderBy: { bestSeller: 'desc' },
            })
        ]);
        res.json({
            success: true,
            products,
            pagination: {
                total,
                page: pageNumber,
                limit: limitNumber,
                pages: Math.ceil(total / limitNumber)
            }
        });
    }
    catch (error) {
        console.error('Fetch Software Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch software products' });
    }
};
exports.getSoftwareProducts = getSoftwareProducts;
const createSoftwareProduct = async (req, res) => {
    try {
        const product = await prisma_1.default.softwareProduct.create({
            data: req.body
        });
        res.status(201).json({ success: true, product });
    }
    catch (error) {
        console.error('Create Software Error:', error);
        res.status(500).json({ success: false, message: 'Failed to create product' });
    }
};
exports.createSoftwareProduct = createSoftwareProduct;
const updateSoftwareProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await prisma_1.default.softwareProduct.update({
            where: { id },
            data: req.body
        });
        res.json({ success: true, product });
    }
    catch (error) {
        console.error('Update Software Error:', error);
        res.status(500).json({ success: false, message: 'Failed to update product' });
    }
};
exports.updateSoftwareProduct = updateSoftwareProduct;
const deleteSoftwareProduct = async (req, res) => {
    try {
        const { id } = req.params;
        // Soft delete via isActive flag for data integrity of past purchases
        const product = await prisma_1.default.softwareProduct.update({
            where: { id },
            data: { isActive: false }
        });
        res.json({ success: true, product });
    }
    catch (error) {
        console.error('Delete Software Error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete product' });
    }
};
exports.deleteSoftwareProduct = deleteSoftwareProduct;
const bulkUploadSoftware = async (req, res) => {
    try {
        const { products } = req.body;
        if (!products || !Array.isArray(products)) {
            return res.status(400).json({ success: false, message: 'Invalid payload. Expected array of products.' });
        }
        let createdCount = 0;
        for (const data of products) {
            // Check if exists by name to avoid duplicates on naive uploads
            const exists = await prisma_1.default.softwareProduct.findFirst({ where: { name: data.name } });
            if (!exists) {
                await prisma_1.default.softwareProduct.create({ data });
                createdCount++;
            }
        }
        res.json({ success: true, message: `Successfully imported ${createdCount} software products.` });
    }
    catch (error) {
        console.error('Bulk Upload Error:', error);
        res.status(500).json({ success: false, message: 'Failed to process bulk upload' });
    }
};
exports.bulkUploadSoftware = bulkUploadSoftware;
const purchaseSoftware = async (req, res) => {
    try {
        const userId = req.user.id;
        const { paymentMethod, items, pin } = req.body;
        console.log('Software Purchase Request:', { userId, paymentMethod, itemsCount: items === null || items === void 0 ? void 0 : items.length });
        // items payload should now be: [{ productId: string, quantity: number }]
        const user = await prisma_1.default.user.findUnique({ where: { id: userId } });
        if (!user)
            return res.status(404).json({ success: false, message: 'User not found' });
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ success: false, message: 'Cart is empty' });
        }
        // 1. Calculate SECURE accurate total from Database, ignoring frontend payload amounts
        let finalTotalAmount = 0;
        const verifiedCartItems = [];
        for (const reqItem of items) {
            const product = await prisma_1.default.softwareProduct.findUnique({ where: { id: reqItem.productId } });
            if (!product || !product.isActive) {
                return res.status(400).json({ success: false, message: `Product ${reqItem.productId} is unavailable.` });
            }
            const itemTotal = Number(product.price) * reqItem.quantity;
            finalTotalAmount += itemTotal;
            verifiedCartItems.push({
                productId: product.id,
                softwareName: product.name,
                unitPrice: Number(product.price),
                quantity: reqItem.quantity,
                amount: itemTotal,
                image: product.image
            });
        }
        console.log(`Secure DB Total calculated: NGN ${finalTotalAmount}`);
        // Handle Paystack Payment
        if (paymentMethod === 'PAYSTACK') {
            if (!user.email) {
                return res.status(400).json({ success: false, message: 'Your account email is missing.' });
            }
            const callbackUrl = `${process.env.APP_URL || 'http://localhost:3000'}/dashboard/software/verify`;
            const initResponse = await paystackService.initializeTransaction(user.email, finalTotalAmount, callbackUrl, {
                type: 'software',
                userId: userId,
                cartItems: verifiedCartItems
            });
            await transaction_service_1.transactionService.initiatePurchase(userId, 'EPIN', finalTotalAmount, {
                subtype: 'SOFTWARE_PURCHASE_BULK',
                items: verifiedCartItems,
                description: `Software Purchase (${verifiedCartItems.length} items)`,
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
        if (!user.transactionPin || user.transactionPin !== pin) {
            return res.status(400).json({ success: false, message: 'Invalid Transaction PIN' });
        }
        // We will create one parent transaction for the total amount
        const transaction = await transaction_service_1.transactionService.initiatePurchase(userId, 'EPIN', finalTotalAmount, {
            subtype: 'SOFTWARE_PURCHASE_BULK',
            description: `Software Purchase (${verifiedCartItems.length} items)`,
            items: verifiedCartItems.map((item) => ({
                ...item,
                licenseKey: `XXXX-YYYY-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`
            }))
        });
        // Complete Transaction immediately
        await transaction_service_1.transactionService.completeTransaction(transaction.id, 'SUCCESS', {
            reference: `SW-${Date.now()}`,
            message: 'Software Delivered Successfully',
            processedItems: transaction.metadata.items
        });
        // Add to Sales count on the DB
        for (const item of verifiedCartItems) {
            await prisma_1.default.softwareProduct.update({
                where: { id: item.productId },
                data: { sales: { increment: item.quantity } }
            });
        }
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
};
exports.purchaseSoftware = purchaseSoftware;
const verifySoftwarePurchase = async (req, res) => {
    var _a;
    try {
        const userId = req.user.userId;
        const { reference } = req.query;
        if (!reference || typeof reference !== 'string') {
            return res.status(400).json({ success: false, message: 'Transaction reference is required' });
        }
        const verification = await paystackService.verifyTransaction(reference);
        if (verification.status !== 'success') {
            return res.status(400).json({ success: false, message: 'Transaction was not successful' });
        }
        let transaction = await prisma_1.default.transaction.findFirst({
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
        if (!transaction) {
            transaction = await prisma_1.default.transaction.findFirst({
                where: {
                    userId,
                    type: 'EPIN',
                    status: 'PENDING',
                },
                orderBy: { createdAt: 'desc' }
            });
        }
        if (!transaction) {
            return res.status(404).json({ success: false, message: 'Pending transaction not found' });
        }
        const items = ((_a = transaction.metadata) === null || _a === void 0 ? void 0 : _a.items) || [];
        const processedItems = items.map((item) => ({
            ...item,
            licenseKey: `PAYSTACK-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`
        }));
        await transaction_service_1.transactionService.completeTransaction(transaction.id, 'SUCCESS', {
            reference: reference,
            message: 'Software Delivered Successfully',
            processedItems
        });
        // Add to Sales count on the DB
        for (const item of items) {
            await prisma_1.default.softwareProduct.update({
                where: { id: item.productId },
                data: { sales: { increment: item.quantity } }
            });
        }
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
};
exports.verifySoftwarePurchase = verifySoftwarePurchase;
