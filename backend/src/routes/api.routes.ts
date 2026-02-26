import { Router } from 'express';
import { register, login, requestOtp, syncFirebaseUser } from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Auth Routes - Firebase
router.post('/auth/sync', syncFirebaseUser); // Primary: Firebase token sync (login + register)
router.post('/auth/request-otp', requestOtp); // Deprecated (kept for stability)
router.post('/auth/register', register);       // Deprecated (kept for stability)
router.post('/auth/login', login);             // Deprecated (kept for stability)

// Notification Routes
import { getNotifications, markRead } from '../controllers/notification.controller';
router.get('/notifications', authenticateToken, getNotifications);
router.post('/notifications/read', authenticateToken, markRead);

// User Profile Routes
import { getProfile, updateProfile, changePassword, submitKyc, setPin, getReferralStats, updateUserTag } from '../controllers/user.controller';
import kycRoutes from './kyc.routes';

router.get('/user/profile', authenticateToken, getProfile);
router.put('/user/profile', authenticateToken, updateProfile);
router.put('/user/tag', authenticateToken, updateUserTag);
router.put('/profile/password', authenticateToken, changePassword);
router.post('/user/pin', authenticateToken, setPin);
router.post('/kyc', authenticateToken, submitKyc);

// Referral Route
router.get('/referrals', authenticateToken, getReferralStats);

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

// Product Routes (Modern)
// Product Routes (Modern)
import productRoutes from './product.routes';
import { purchaseSoftware } from '../controllers/software.controller';

router.use('/products', productRoutes);
router.post('/products/software/purchase', authenticateToken, purchaseSoftware);

// Virtual Numbers
import * as virtualNumberController from '../controllers/virtual-number.controller';
router.get('/virtual-numbers/available', authenticateToken, virtualNumberController.getAvailableNumbers);
router.post('/virtual-numbers/rent', authenticateToken, virtualNumberController.rentNumber);
router.get('/virtual-numbers/my', authenticateToken, virtualNumberController.getMyNumbers);
router.get('/virtual-numbers/:id/messages', authenticateToken, virtualNumberController.getNumberMessages);
router.post('/virtual-numbers/cancel', authenticateToken, virtualNumberController.cancelNumberSubscription);
router.post('/webhooks/vonage/sms', virtualNumberController.handleSmsWebhook);

// Virtual Cards
import * as virtualCardController from '../controllers/virtual-card.controller';
router.post('/cards/create', authenticateToken, virtualCardController.createCard);
router.get('/cards/my', authenticateToken, virtualCardController.getMyCards);
router.get('/cards/:cardId', authenticateToken, virtualCardController.getCardDetails);
router.post('/cards/freeze', authenticateToken, virtualCardController.toggleCardFreeze);
router.post('/cards/fund', authenticateToken, virtualCardController.fundCard);

// Admin Routes
import { getAllUsers, getAllTransactions, getAdminStats } from '../controllers/admin.controller';
import { authorizeRole } from '../middleware/auth.middleware';

router.get('/admin/users', authenticateToken, authorizeRole(['ADMIN', 'SUPERADMIN']), getAllUsers);
router.get('/admin/transactions', authenticateToken, authorizeRole(['ADMIN', 'SUPERADMIN']), getAllTransactions);
router.get('/admin/stats', authenticateToken, authorizeRole(['ADMIN', 'SUPERADMIN']), getAdminStats);



export default router;
