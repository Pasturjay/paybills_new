"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VonageProvider = void 0;
const axios_1 = __importDefault(require("axios"));
class VonageProvider {
    constructor() {
        this.config = {
            apiKey: process.env.VONAGE_API_KEY || 'test_key',
            apiSecret: process.env.VONAGE_API_SECRET || 'test_secret',
            baseUrl: 'https://rest.nexmo.com'
        };
    }
    // 1. Search Available Numbers
    async searchNumbers(countryCode) {
        try {
            const response = await axios_1.default.get(`${this.config.baseUrl}/number/search`, {
                params: {
                    api_key: this.config.apiKey,
                    api_secret: this.config.apiSecret,
                    country: countryCode,
                    features: 'SMS' // We want SMS enabled numbers
                }
            });
            if (response.data.numbers) {
                return response.data.numbers.map((n) => ({
                    msisdn: n.msisdn,
                    cost: n.cost,
                    type: n.type,
                    features: n.features
                }));
            }
            return [];
        }
        catch (error) {
            console.error('Vonage Search Error:', error);
            throw new Error('Failed to search numbers');
        }
    }
    // 2. Rent Number
    async rentNumber(countryCode, msisdn) {
        var _a, _b, _c;
        try {
            const response = await axios_1.default.post(`${this.config.baseUrl}/number/buy`, new URLSearchParams({
                api_key: this.config.apiKey,
                api_secret: this.config.apiSecret,
                country: countryCode,
                msisdn: msisdn
            }), {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });
            // Vonage returns 200 OK even on error sometimes strings like "error-code"
            if (response.data['error-code'] && response.data['error-code'] !== '200') {
                throw new Error(`Vonage Error: ${response.data['error-code-label']}`);
            }
            return {
                status: 'SUCCESS',
                msisdn: msisdn
            };
        }
        catch (error) {
            console.error('Vonage Rent Error:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
            throw new Error('Failed to rent number: ' + (((_c = (_b = error.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c['error-code-label']) || error.message));
        }
    }
    // 3. Cancel Number
    async cancelNumber(countryCode, msisdn) {
        try {
            const response = await axios_1.default.post(`${this.config.baseUrl}/number/cancel`, new URLSearchParams({
                api_key: this.config.apiKey,
                api_secret: this.config.apiSecret,
                country: countryCode,
                msisdn: msisdn
            }));
            if (response.data['error-code'] && response.data['error-code'] !== '200') {
                throw new Error(`Vonage Error: ${response.data['error-code-label']}`);
            }
            return true;
        }
        catch (error) {
            console.error('Vonage Cancel Error:', error);
            // Don't throw for cancellation if possible, logs sufficient for audit
            return false;
        }
    }
    // 4. Verify Webhook Signature (Inbound SMS)
    // Vonage signs using HMAC-SHA256 usually if confident configured, or MD5
    verifySignature(params) {
        // Simplified check: In production, verify actual signature from headers or query params
        // For now, check if message has basic fields
        if (!params.msisdn || !params.to || !params.text)
            return false;
        return true;
    }
}
exports.VonageProvider = VonageProvider;
