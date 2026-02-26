"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.purchaseAirtime = exports.getAirtimeProviders = void 0;
const billing_service_1 = require("../services/billing.service");
const clubkonnect_provider_1 = require("../providers/clubkonnect.provider");
const billingService = new billing_service_1.BillingService();
const provider = new clubkonnect_provider_1.ClubKonnectProvider();
const getAirtimeProviders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const providers = yield provider.getAirtimeProviders();
        res.json({ status: 'success', data: providers });
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});
exports.getAirtimeProviders = getAirtimeProviders;
const purchaseAirtime = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // @ts-ignore
        const userId = req.user.userId;
        const { networkId, phoneNumber, amount } = req.body;
        if (!networkId || !phoneNumber || !amount) {
            return res.status(400).json({ status: 'error', message: 'Missing required fields' });
        }
        const result = yield billingService.purchaseAirtime(userId, networkId, phoneNumber, Number(amount));
        if (result.status === 'FAILED') {
            return res.status(400).json(result);
        }
        res.json(result);
    }
    catch (error) {
        console.error('Purchase Airtime Controller Error:', error);
        res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
});
exports.purchaseAirtime = purchaseAirtime;
