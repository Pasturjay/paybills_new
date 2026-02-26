import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { getAirtimeProviders, purchaseAirtime } from '../controllers/bills.controller';

const router = Router();

router.get('/airtime/providers', authenticateToken, getAirtimeProviders);
router.post('/airtime/purchase', authenticateToken, purchaseAirtime);

export default router;
