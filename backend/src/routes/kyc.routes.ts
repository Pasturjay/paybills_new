
import { Router } from 'express';
import { KYCController } from '../controllers/kyc.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();
const kycController = new KYCController();

// Protected route to start KYC
router.post('/initiate', authenticateToken, kycController.initiateKYC);

// Public webhook route (should ideally be protected by signature or secret)
router.post('/webhook', kycController.handleWebhook);

export default router;
