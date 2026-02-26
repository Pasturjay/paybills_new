import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { getProducts, purchaseEducation, purchaseGiftCard, sellGiftCard, purchaseAirtime, purchaseData, validateCable, purchaseCable, purchaseElectricity, purchaseBetting, purchaseSoftware } from '../controllers/product.controller';
import { getAvailableNumbers, rentNumber } from '../controllers/virtual-number.controller';

const router = Router();

// Product Routes
router.get('/', authenticateToken, getProducts); // /api/products

router.post('/education/purchase', authenticateToken, purchaseEducation);
router.get('/virtual-number/available', authenticateToken, getAvailableNumbers);
router.post('/virtual-number/purchase', authenticateToken, rentNumber);
router.post('/gift-card/buy', authenticateToken, purchaseGiftCard);
router.post('/gift-card/sell', authenticateToken, sellGiftCard);

// Airtime & Data
router.post('/airtime/purchase', authenticateToken, purchaseAirtime);
router.post('/data/purchase', authenticateToken, purchaseData);

// Cable
router.post('/cable/validate', authenticateToken, validateCable);
router.post('/cable/purchase', authenticateToken, purchaseCable);

// Electricity
router.post('/electricity/purchase', authenticateToken, purchaseElectricity);

// Betting
router.post('/betting/purchase', authenticateToken, purchaseBetting);

// Software
router.post('/software/purchase', authenticateToken, purchaseSoftware);

export default router;
