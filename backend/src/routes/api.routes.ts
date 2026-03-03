import { Router } from 'express';
import { register, login, requestOtp, syncFirebaseUser, refreshSession, logout } from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Auth Routes - Firebase
router.post('/auth/sync', syncFirebaseUser); // Primary: Firebase token sync (login + register)
router.post('/auth/refresh', refreshSession); // Token Rotation
router.post('/auth/logout', logout);          // Secure Logout
router.post('/auth/request-otp', requestOtp); // Deprecated
router.post('/auth/register', register);       // Deprecated
router.post('/auth/login', login);             // Deprecated
router.post('/webhooks/paystack', require('../controllers/paystack.webhook').handlePaystackWebhook);

// Notification Routes
import { getNotifications, markRead } from '../controllers/notification.controller';
router.get('/notifications', authenticateToken, getNotifications);
router.post('/notifications/read', authenticateToken, markRead);

// User Profile Routes
import { getProfile, updateProfile, changePassword, setPin, getReferralStats, updateUserTag } from '../controllers/user.controller';
import kycRoutes from './kyc.routes';

router.get('/user/profile', authenticateToken, getProfile);
router.put('/user/profile', authenticateToken, updateProfile);
router.put('/user/tag', authenticateToken, updateUserTag);
router.put('/profile/password', authenticateToken, changePassword);
router.post('/user/pin', authenticateToken, setPin);
// Legacy KYC (handled via kycRoutes now)

import { deleteAccount } from '../controllers/user.controller';
router.delete('/user/account', authenticateToken, deleteAccount);

// Referral Route
router.get('/referrals', authenticateToken, getReferralStats);

import { getPurchaseContext } from '../controllers/purchase.controller';
router.get('/purchase/context', authenticateToken, getPurchaseContext);

router.use('/kyc', kycRoutes);

// Wallet Routes
import { getBalance, simulateFund, getUserTransactions, initiateFunding, verifyFunding, getVirtualAccount, transferFunds, lookupUser } from '../controllers/wallet.controller';
// ... existing wallet routes
router.get('/wallet/balance', authenticateToken, getBalance);
router.get('/wallet/transactions', authenticateToken, getUserTransactions);
router.post('/wallet/fund', authenticateToken, simulateFund); // Legacy/Simulated
router.post('/wallet/fund/initialize', authenticateToken, initiateFunding);
router.get('/wallet/fund/verify', authenticateToken, verifyFunding);
router.get('/wallet/virtual-account', authenticateToken, getVirtualAccount);
router.post('/wallet/transfer', authenticateToken, transferFunds);
router.post('/wallet/transfer/lookup', authenticateToken, lookupUser);

import productRoutes from './product.routes';

router.use('/products', productRoutes);

// ─── Services Routes (Airtime, Data, Bills) ─────────────────────────────────
// These routes are called directly by the frontend at /api/services/*
import { purchaseAirtime, purchaseData, purchaseBill, verifyCustomer } from '../controllers/service.controller';
router.post('/services/airtime', authenticateToken, purchaseAirtime);
router.post('/services/data', authenticateToken, purchaseData);
router.post('/services/bill', authenticateToken, purchaseBill);
router.post('/services/verify', authenticateToken, verifyCustomer);

// Virtual Numbers
import * as virtualNumberController from '../controllers/virtual-number.controller';
import partnerRoutes from './partner.routes';

router.use('/partner', partnerRoutes);

router.get('/virtual-numbers/available', authenticateToken, virtualNumberController.getAvailableNumbers);
router.post('/virtual-numbers/rent', authenticateToken, virtualNumberController.rentNumber);
router.get('/virtual-numbers/my', authenticateToken, virtualNumberController.getMyNumbers);
router.get('/virtual-numbers/:id/messages', authenticateToken, virtualNumberController.getNumberMessages);
router.post('/virtual-numbers/cancel', authenticateToken, virtualNumberController.cancelNumberSubscription);
router.post('/webhooks/vonage/sms', virtualNumberController.handleSmsWebhook);

// Blog Routes (Public + Admin)
import * as blogController from '../controllers/blog.controller';
import { authorizeRole } from '../middleware/auth.middleware';

router.get('/blog', blogController.getAllPosts);
router.get('/blog/:slug', blogController.getPostBySlug);
router.post('/admin/blog', authenticateToken, authorizeRole('ADMIN', 'SUPERADMIN'), blogController.createPost);
router.put('/admin/blog/:id', authenticateToken, authorizeRole('ADMIN', 'SUPERADMIN'), blogController.updatePost);
router.delete('/admin/blog/:id', authenticateToken, authorizeRole('ADMIN', 'SUPERADMIN'), blogController.deletePost);

// Virtual Cards
import * as virtualCardController from '../controllers/virtual-card.controller';
router.post('/cards/create', authenticateToken, virtualCardController.createCard);
router.get('/cards/my', authenticateToken, virtualCardController.getMyCards);
router.get('/cards/:cardId', authenticateToken, virtualCardController.getCardDetails);
router.post('/cards/freeze', authenticateToken, virtualCardController.toggleCardFreeze);
router.post('/cards/fund', authenticateToken, virtualCardController.fundCard);

// Admin Routes
import { getAllUsers, getAllTransactions, getAdminStats, getServiceStatus, updateServiceStatus, getProviderStatus, updateUserStatus } from '../controllers/admin.controller';

router.get('/admin/users', authenticateToken, authorizeRole('ADMIN', 'SUPERADMIN'), getAllUsers);
router.get('/admin/transactions', authenticateToken, authorizeRole('ADMIN', 'SUPERADMIN'), getAllTransactions);
router.get('/admin/stats', authenticateToken, authorizeRole('ADMIN', 'SUPERADMIN'), getAdminStats);
router.get('/admin/services', authenticateToken, authorizeRole('ADMIN', 'SUPERADMIN'), getServiceStatus);
router.put('/admin/services/:id', authenticateToken, authorizeRole('ADMIN', 'SUPERADMIN'), updateServiceStatus);
router.get('/admin/providers', authenticateToken, authorizeRole('ADMIN', 'SUPERADMIN'), getProviderStatus);
router.put('/admin/users/:id/status', authenticateToken, authorizeRole('ADMIN', 'SUPERADMIN'), updateUserStatus);



export default router;
