import { Request, Response } from 'express';
import { transactionService } from '../services/transaction.service';
import { PaystackService } from '../services/paystack.service';
import prisma from '../prisma';

const paystackService = new PaystackService();

export const purchaseSoftware = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const { paymentMethod, items, amount, pin } = req.body;
        console.log('Software Purchase Request:', { userId, paymentMethod, amount, itemsCount: items?.length });
        // items: [{ itemCode, amount, softwareName, quantity }]

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        // Normalize single purchase to items array if needed (backward compatibility)
        const cartItems = items || [{ itemCode: req.body.itemCode, amount: req.body.amount, softwareName: req.body.softwareName, quantity: 1 }];
        const totalAmount = amount || cartItems.reduce((sum: number, item: any) => sum + (item.amount * (item.quantity || 1)), 0);

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

            const initResponse = await paystackService.initializeTransaction(user.email, Number(totalAmount), callbackUrl);

            // Create Pending Transaction (Single transaction for the bulk order)
            await transactionService.initiatePurchase(
                userId,
                'EPIN',
                Number(totalAmount),
                {
                    subtype: 'SOFTWARE_PURCHASE_BULK',
                    items: cartItems,
                    description: `Software Purchase (${cartItems.length} items)`,
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
        // 1. Verify PIN
        if (!user.transactionPin || user.transactionPin !== pin) {
            return res.status(400).json({ success: false, message: 'Invalid Transaction PIN' });
        }

        // 2. Process Items & Generate Keys
        const processedItems = [];

        // We will create one parent transaction for the total amount
        const transaction = await transactionService.initiatePurchase(
            userId,
            'EPIN',
            Number(totalAmount),
            {
                subtype: 'SOFTWARE_PURCHASE_BULK',
                description: `Software Purchase (${cartItems.length} items)`,
                items: cartItems.map((item: any) => ({
                    ...item,
                    licenseKey: `XXXX-YYYY-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}` // Generate for each
                }))
            }
        );

        // 3. Complete Transaction immediately
        await transactionService.completeTransaction(transaction.id, 'SUCCESS', {
            reference: `SW-${Date.now()}`,
            message: 'Software Delivered Successfully',
            processedItems: (transaction.metadata as any).items
        });

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
