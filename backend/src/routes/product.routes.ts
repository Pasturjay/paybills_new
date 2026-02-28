import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { getProducts, purchaseEducation, purchaseGiftCard, sellGiftCard, purchaseAirtime, purchaseData, validateCable, purchaseCable, purchaseElectricity, purchaseBetting } from '../controllers/product.controller';
import { purchaseSoftware, verifySoftwarePurchase, getSoftwareProducts, createSoftwareProduct, updateSoftwareProduct, deleteSoftwareProduct, bulkUploadSoftware } from '../controllers/software.controller';
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
router.get('/software', getSoftwareProducts); // Public listing
router.post('/software/purchase', authenticateToken, purchaseSoftware);
router.get('/software/verify', authenticateToken, verifySoftwarePurchase);

// Software Admin
router.post('/software', authenticateToken, createSoftwareProduct);
router.put('/software/:id', authenticateToken, updateSoftwareProduct);
router.delete('/software/:id', authenticateToken, deleteSoftwareProduct);
router.post('/software/bulk-upload', authenticateToken, bulkUploadSoftware);

export default router;
