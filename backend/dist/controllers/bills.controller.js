"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.purchaseAirtime = exports.getAirtimeProviders = void 0;
const billing_service_1 = require("../services/billing.service");
const clubkonnect_provider_1 = require("../providers/clubkonnect.provider");
const billingService = new billing_service_1.BillingService();
const provider = new clubkonnect_provider_1.ClubKonnectProvider();
const getAirtimeProviders = async (req, res) => {
    try {
        const providers = await provider.getAirtimeProviders();
        res.json({ status: 'success', data: providers });
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};
exports.getAirtimeProviders = getAirtimeProviders;
const purchaseAirtime = async (req, res) => {
    try {
        // @ts-ignore
        const userId = req.user.id;
        const { networkId, phoneNumber, amount } = req.body;
        if (!networkId || !phoneNumber || !amount) {
            return res.status(400).json({ status: 'error', message: 'Missing required fields' });
        }
        const result = await billingService.purchaseAirtime(userId, networkId, phoneNumber, Number(amount));
        if (result.status === 'FAILED') {
            return res.status(400).json(result);
        }
        res.json(result);
    }
    catch (error) {
        console.error('Purchase Airtime Controller Error:', error);
        res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
};
exports.purchaseAirtime = purchaseAirtime;
