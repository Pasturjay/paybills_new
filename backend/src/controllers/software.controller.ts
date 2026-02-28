import { Request, Response } from 'express';
import { transactionService } from '../services/transaction.service';
import { PaystackService } from '../services/paystack.service';
import prisma from '../prisma';

const paystackService = new PaystackService();

export const getSoftwareProducts = async (req: Request, res: Response) => {
    try {
        const { category, search, page = 1, limit = 50, admin = false } = req.query;
        const pageNumber = Number(page);
        const limitNumber = Number(limit);

        const where: any = {};

        // If not admin, only show active products
        if (!admin) {
            where.isActive = true;
        }

        if (category && category !== 'All') {
            where.category = category as string;
        }

        if (search) {
            where.OR = [
                { name: { contains: search as string, mode: 'insensitive' } },
                { description: { contains: search as string, mode: 'insensitive' } },
                { brand: { contains: search as string, mode: 'insensitive' } }
            ];
        }

        const [total, products] = await Promise.all([
            prisma.softwareProduct.count({ where }),
            prisma.softwareProduct.findMany({
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
    } catch (error: any) {
        console.error('Fetch Software Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch software products' });
    }
};

export const createSoftwareProduct = async (req: Request, res: Response) => {
    try {
        const product = await prisma.softwareProduct.create({
            data: req.body
        });
        res.status(201).json({ success: true, product });
    } catch (error: any) {
        console.error('Create Software Error:', error);
        res.status(500).json({ success: false, message: 'Failed to create product' });
    }
};

export const updateSoftwareProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const product = await prisma.softwareProduct.update({
            where: { id },
            data: req.body
        });
        res.json({ success: true, product });
    } catch (error: any) {
        console.error('Update Software Error:', error);
        res.status(500).json({ success: false, message: 'Failed to update product' });
    }
};

export const deleteSoftwareProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        // Soft delete via isActive flag for data integrity of past purchases
        const product = await prisma.softwareProduct.update({
            where: { id },
            data: { isActive: false }
        });
        res.json({ success: true, product });
    } catch (error: any) {
        console.error('Delete Software Error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete product' });
    }
};

export const bulkUploadSoftware = async (req: Request, res: Response) => {
    try {
        const { products } = req.body;

        if (!products || !Array.isArray(products)) {
            return res.status(400).json({ success: false, message: 'Invalid payload. Expected array of products.' });
        }

        let createdCount = 0;
        for (const data of products) {
            // Check if exists by name to avoid duplicates on naive uploads
            const exists = await prisma.softwareProduct.findFirst({ where: { name: data.name } });
            if (!exists) {
                await prisma.softwareProduct.create({ data });
                createdCount++;
            }
        }

        res.json({ success: true, message: `Successfully imported ${createdCount} software products.` });
    } catch (error: any) {
        console.error('Bulk Upload Error:', error);
        res.status(500).json({ success: false, message: 'Failed to process bulk upload' });
    }
};

export const purchaseSoftware = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { paymentMethod, items, pin } = req.body;
        console.log('Software Purchase Request:', { userId, paymentMethod, itemsCount: items?.length });

        // items payload should now be: [{ productId: string, quantity: number }]

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ success: false, message: 'Cart is empty' });
        }

        // 1. Calculate SECURE accurate total from Database, ignoring frontend payload amounts
        let finalTotalAmount = 0;
        const verifiedCartItems = [];

        for (const reqItem of items) {
            const product = await prisma.softwareProduct.findUnique({ where: { id: reqItem.productId } });
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

            await transactionService.initiatePurchase(
                userId,
                'EPIN',
                finalTotalAmount,
                {
                    subtype: 'SOFTWARE_PURCHASE_BULK',
                    items: verifiedCartItems,
                    description: `Software Purchase (${verifiedCartItems.length} items)`,
                    paymentMethod: 'PAYSTACK'
                }
            );

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
        const transaction = await transactionService.initiatePurchase(
            userId,
            'EPIN',
            finalTotalAmount,
            {
                subtype: 'SOFTWARE_PURCHASE_BULK',
                description: `Software Purchase (${verifiedCartItems.length} items)`,
                items: verifiedCartItems.map((item: any) => ({
                    ...item,
                    licenseKey: `XXXX-YYYY-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`
                }))
            }
        );

        // Complete Transaction immediately
        await transactionService.completeTransaction(transaction.id, 'SUCCESS', {
            reference: `SW-${Date.now()}`,
            message: 'Software Delivered Successfully',
            processedItems: (transaction.metadata as any).items
        });

        // Add to Sales count on the DB
        for (const item of verifiedCartItems) {
            await prisma.softwareProduct.update({
                where: { id: item.productId },
                data: { sales: { increment: item.quantity } }
            });
        }

        res.json({
            success: true,
            message: 'Software purchase successful',
            data: {
                transactionId: transaction.id,
                items: (transaction.metadata as any).items
            }
        });

    } catch (error: any) {
        console.error('Software Purchase Failed:', error);
        res.status(500).json({ success: false, message: error.message || 'Purchase failed' });
    }
};

export const verifySoftwarePurchase = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const { reference } = req.query;

        if (!reference || typeof reference !== 'string') {
            return res.status(400).json({ success: false, message: 'Transaction reference is required' });
        }

        const verification = await paystackService.verifyTransaction(reference);

        if (verification.status !== 'success') {
            return res.status(400).json({ success: false, message: 'Transaction was not successful' });
        }

        let transaction = await prisma.transaction.findFirst({
            where: { reference: reference }
        });

        if (transaction && transaction.status === 'SUCCESS') {
            return res.json({
                success: true,
                message: 'Software already delivered',
                data: {
                    transactionId: transaction.id,
                    items: (transaction.metadata as any).processedItems || (transaction.metadata as any).items
                }
            });
        }

        if (!transaction) {
            transaction = await prisma.transaction.findFirst({
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

        const items = (transaction.metadata as any)?.items || [];
        const processedItems = items.map((item: any) => ({
            ...item,
            licenseKey: `PAYSTACK-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`
        }));

        await transactionService.completeTransaction(transaction.id, 'SUCCESS', {
            reference: reference,
            message: 'Software Delivered Successfully',
            processedItems
        });

        // Add to Sales count on the DB
        for (const item of items) {
            await prisma.softwareProduct.update({
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

    } catch (error: any) {
        console.error('Verify Software Error:', error);
        res.status(500).json({ success: false, message: error.message || 'Verification failed' });
    }
};
