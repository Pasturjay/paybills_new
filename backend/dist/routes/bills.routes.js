"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const bills_controller_1 = require("../controllers/bills.controller");
const router = (0, express_1.Router)();
router.get('/airtime/providers', auth_middleware_1.authenticateToken, bills_controller_1.getAirtimeProviders);
router.post('/airtime/purchase', auth_middleware_1.authenticateToken, bills_controller_1.purchaseAirtime);
exports.default = router;
