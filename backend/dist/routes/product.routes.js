"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const product_controller_1 = require("../controllers/product.controller");
const software_controller_1 = require("../controllers/software.controller");
const virtual_number_controller_1 = require("../controllers/virtual-number.controller");
const router = (0, express_1.Router)();
// Product Routes
router.get('/', auth_middleware_1.authenticateToken, product_controller_1.getProducts); // /api/products
router.post('/education/purchase', auth_middleware_1.authenticateToken, product_controller_1.purchaseEducation);
router.get('/virtual-number/available', auth_middleware_1.authenticateToken, virtual_number_controller_1.getAvailableNumbers);
router.post('/virtual-number/purchase', auth_middleware_1.authenticateToken, virtual_number_controller_1.rentNumber);
router.post('/gift-card/buy', auth_middleware_1.authenticateToken, product_controller_1.purchaseGiftCard);
router.post('/gift-card/sell', auth_middleware_1.authenticateToken, product_controller_1.sellGiftCard);
// Airtime & Data
router.post('/airtime/purchase', auth_middleware_1.authenticateToken, product_controller_1.purchaseAirtime);
router.post('/data/purchase', auth_middleware_1.authenticateToken, product_controller_1.purchaseData);
// Cable
router.post('/cable/validate', auth_middleware_1.authenticateToken, product_controller_1.validateCable);
router.post('/cable/purchase', auth_middleware_1.authenticateToken, product_controller_1.purchaseCable);
// Electricity
router.post('/electricity/purchase', auth_middleware_1.authenticateToken, product_controller_1.purchaseElectricity);
// Betting
router.post('/betting/purchase', auth_middleware_1.authenticateToken, product_controller_1.purchaseBetting);
// Software
router.post('/software/purchase', auth_middleware_1.authenticateToken, software_controller_1.purchaseSoftware);
router.get('/software/verify', auth_middleware_1.authenticateToken, software_controller_1.verifySoftwarePurchase);
exports.default = router;
