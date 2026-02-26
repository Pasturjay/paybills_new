"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const kyc_controller_1 = require("../controllers/kyc.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
const kycController = new kyc_controller_1.KYCController();
// Protected route to start KYC
router.post('/initiate', auth_middleware_1.authenticateToken, kycController.initiateKYC);
// Public webhook route (should ideally be protected by signature or secret)
router.post('/webhook', kycController.handleWebhook);
exports.default = router;
