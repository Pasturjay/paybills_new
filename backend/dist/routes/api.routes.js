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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const wallet_controller_1 = require("../controllers/wallet.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Auth Routes
// Auth Routes
router.post('/auth/register', auth_controller_1.register);
router.post('/auth/login', auth_controller_1.login);
// Notification Routes
const notification_controller_1 = require("../controllers/notification.controller");
router.get('/notifications', auth_middleware_1.authenticateToken, notification_controller_1.getNotifications);
router.post('/notifications/read', auth_middleware_1.authenticateToken, notification_controller_1.markRead);
// User Profile Routes
const user_controller_1 = require("../controllers/user.controller");
const kyc_routes_1 = __importDefault(require("./kyc.routes"));
router.get('/user/profile', auth_middleware_1.authenticateToken, user_controller_1.getProfile);
router.put('/user/profile', auth_middleware_1.authenticateToken, user_controller_1.updateProfile);
router.put('/profile/password', auth_middleware_1.authenticateToken, user_controller_1.changePassword);
router.post('/user/pin', auth_middleware_1.authenticateToken, user_controller_1.setPin);
router.post('/kyc', auth_middleware_1.authenticateToken, user_controller_1.submitKyc);
// Referral Route
router.get('/referrals', auth_middleware_1.authenticateToken, user_controller_1.getReferralStats);
router.use('/kyc', kyc_routes_1.default);
// Wallet Routes
router.get('/wallet/balance', auth_middleware_1.authenticateToken, wallet_controller_1.getBalance);
router.get('/wallet/transactions', auth_middleware_1.authenticateToken, wallet_controller_1.getUserTransactions);
router.post('/wallet/fund', auth_middleware_1.authenticateToken, wallet_controller_1.simulateFund); // Legacy/Simulated
router.post('/wallet/fund/initialize', auth_middleware_1.authenticateToken, wallet_controller_1.initiateFunding);
router.get('/wallet/fund/verify', auth_middleware_1.authenticateToken, wallet_controller_1.verifyFunding);
router.get('/wallet/virtual-account', auth_middleware_1.authenticateToken, wallet_controller_1.getVirtualAccount);
router.post('/wallet/transfer', auth_middleware_1.authenticateToken, wallet_controller_1.transferFunds);
// Product Routes (Modern)
// Product Routes (Modern)
const product_routes_1 = __importDefault(require("./product.routes"));
const software_controller_1 = require("../controllers/software.controller");
router.use('/products', product_routes_1.default);
router.post('/products/software/purchase', auth_middleware_1.authenticateToken, software_controller_1.purchaseSoftware);
// Virtual Numbers
const virtualNumberController = __importStar(require("../controllers/virtual-number.controller"));
router.get('/virtual-numbers/available', auth_middleware_1.authenticateToken, virtualNumberController.getAvailableNumbers);
router.post('/virtual-numbers/rent', auth_middleware_1.authenticateToken, virtualNumberController.rentNumber);
router.get('/virtual-numbers/my', auth_middleware_1.authenticateToken, virtualNumberController.getMyNumbers);
router.get('/virtual-numbers/:id/messages', auth_middleware_1.authenticateToken, virtualNumberController.getNumberMessages);
router.post('/virtual-numbers/cancel', auth_middleware_1.authenticateToken, virtualNumberController.cancelNumberSubscription);
router.post('/webhooks/vonage/sms', virtualNumberController.handleSmsWebhook);
// Virtual Cards
const virtualCardController = __importStar(require("../controllers/virtual-card.controller"));
router.post('/cards/create', auth_middleware_1.authenticateToken, virtualCardController.createCard);
router.get('/cards/my', auth_middleware_1.authenticateToken, virtualCardController.getMyCards);
router.get('/cards/:cardId', auth_middleware_1.authenticateToken, virtualCardController.getCardDetails);
router.post('/cards/freeze', auth_middleware_1.authenticateToken, virtualCardController.toggleCardFreeze);
router.post('/cards/fund', auth_middleware_1.authenticateToken, virtualCardController.fundCard);
// Admin Routes
const admin_controller_1 = require("../controllers/admin.controller");
const auth_middleware_2 = require("../middleware/auth.middleware");
router.get('/admin/users', auth_middleware_1.authenticateToken, (0, auth_middleware_2.authorizeRole)(['ADMIN', 'SUPERADMIN']), admin_controller_1.getAllUsers);
router.get('/admin/transactions', auth_middleware_1.authenticateToken, (0, auth_middleware_2.authorizeRole)(['ADMIN', 'SUPERADMIN']), admin_controller_1.getAllTransactions);
router.get('/admin/stats', auth_middleware_1.authenticateToken, (0, auth_middleware_2.authorizeRole)(['ADMIN', 'SUPERADMIN']), admin_controller_1.getAdminStats);
exports.default = router;
