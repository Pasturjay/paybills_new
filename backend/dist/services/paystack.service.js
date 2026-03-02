"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaystackService = void 0;
const axios_1 = __importDefault(require("axios"));
class PaystackService {
    constructor() {
        this.baseUrl = 'https://api.paystack.co';
        this.secretKey = process.env.PAYSTACK_SECRET_KEY || '';
        if (!this.secretKey) {
            console.warn('PAYSTACK_SECRET_KEY is not set.');
        }
    }
    async initializeTransaction(email, amount, callbackUrl, metadata = {}) {
        var _a, _b, _c;
        try {
            // Amount in Kobo
            const amountInKobo = Math.round(amount * 100);
            const response = await axios_1.default.post(`${this.baseUrl}/transaction/initialize`, {
                email,
                amount: amountInKobo,
                callback_url: callbackUrl,
                metadata: metadata,
                channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer']
            }, {
                headers: {
                    Authorization: `Bearer ${this.secretKey}`,
                    'Content-Type': 'application/json',
                },
            });
            if (!response.data.status) {
                throw new Error(response.data.message || 'Failed to initialize transaction');
            }
            return response.data.data;
        }
        catch (error) {
            console.error('Paystack Initialize Error:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
            throw new Error(((_c = (_b = error.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.message) || 'Paystack initialization failed');
        }
    }
    async verifyTransaction(reference) {
        var _a, _b, _c;
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/transaction/verify/${reference}`, {
                headers: {
                    Authorization: `Bearer ${this.secretKey}`,
                },
            });
            if (!response.data.status) {
                throw new Error(response.data.message || 'Verification failed');
            }
            return response.data.data;
        }
        catch (error) {
            console.error('Paystack Verify Error:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
            throw new Error(((_c = (_b = error.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.message) || 'Paystack verification failed');
        }
    }
    async createDedicatedAccount(email, firstName, lastName, phone) {
        var _a, _b, _c, _d, _e;
        try {
            // 1. Create or Fetch Customer
            let customerCode;
            try {
                const customerResponse = await axios_1.default.post(`${this.baseUrl}/customer`, { email, first_name: firstName, last_name: lastName, phone }, { headers: { Authorization: `Bearer ${this.secretKey}` } });
                customerCode = customerResponse.data.data.customer_code;
            }
            catch (err) {
                // If customer exists, we might get an error or we might need to fetch. 
                // For simplicity, if creation fails, try to fetch or assume existing logic if needed.
                // But Paystack create customer is usually idempotent or returns existing.
                // Let's assume we proceed or handle "Customer already exists" by fetching.
                if (((_b = (_a = err.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) === "Customer already exists") {
                    // We need to fetch the customer code. 
                    // For now, let's assume we can fetch by email
                    const fetchResponse = await axios_1.default.get(`${this.baseUrl}/customer/${email}`, { headers: { Authorization: `Bearer ${this.secretKey}` } });
                    customerCode = fetchResponse.data.data.customer_code;
                }
                else {
                    throw err;
                }
            }
            // 2. Create Dedicated Account
            const dvaResponse = await axios_1.default.post(`${this.baseUrl}/dedicated_account`, {
                customer: customerCode,
                preferred_bank: "wema-bank",
                metadata: { type: 'funding' }
            }, { headers: { Authorization: `Bearer ${this.secretKey}` } });
            return dvaResponse.data.data;
        }
        catch (error) {
            console.error('Paystack DVA Error:', ((_c = error.response) === null || _c === void 0 ? void 0 : _c.data) || error.message);
            // Verify if it's already assigned
            throw new Error(((_e = (_d = error.response) === null || _d === void 0 ? void 0 : _d.data) === null || _e === void 0 ? void 0 : _e.message) || 'Failed to create dedicated account');
        }
    }
}
exports.PaystackService = PaystackService;
