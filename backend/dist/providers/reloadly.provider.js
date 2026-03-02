"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReloadlyProvider = void 0;
const axios_1 = __importDefault(require("axios"));
class ReloadlyProvider {
    constructor() {
        this.accessToken = null;
        this.tokenExpiry = 0;
        this.clientId = process.env.RELOADLY_CLIENT_ID || '';
        this.clientSecret = process.env.RELOADLY_CLIENT_SECRET || '';
        this.mode = process.env.RELOADLY_MODE || 'sandbox';
        this.audience = this.mode === 'sandbox'
            ? 'https://giftcards-sandbox.reloadly.com'
            : 'https://giftcards.reloadly.com';
    }
    get baseUrl() {
        return this.audience;
    }
    async getAccessToken() {
        if (this.accessToken && Date.now() < this.tokenExpiry) {
            return this.accessToken;
        }
        try {
            const response = await axios_1.default.post('https://auth.reloadly.com/oauth/token', {
                client_id: this.clientId,
                client_secret: this.clientSecret,
                grant_type: 'client_credentials',
                audience: this.audience
            });
            this.accessToken = response.data.access_token;
            // Set expiry 60 seconds before actual expiry to be safe
            this.tokenExpiry = Date.now() + (response.data.expires_in * 1000) - 60000;
            return this.accessToken;
        }
        catch (error) {
            console.error('Reloadly Auth Error:', error);
            throw new Error('Failed to authenticate with Reloadly');
        }
    }
    async purchaseGiftCard(brandId, amount, quantity, ref) {
        var _a, _b, _c, _d;
        try {
            const token = await this.getAccessToken();
            // Reloadly typically requires product ID, sender name, recipient email etc.
            // Mapping brandId to productId or assuming brandId IS productId
            // For this implementation we'll assume brandId is the Reloadly Product ID.
            const payload = {
                productId: Number(brandId),
                quantity: quantity,
                unitPrice: amount,
                senderName: "PayBills",
                recipientEmail: "customer@example.com", // In real app, pass this from service
                customIdentifier: ref
            };
            const response = await axios_1.default.post(`${this.baseUrl}/orders`, payload, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            // Extract codes from response
            // Reloadly structure varies slightly but usually contains transactionId and cards array
            const cards = response.data.cards || [];
            const codes = cards.map((card) => card.cardNumber || card.pinCode);
            return {
                success: true,
                reference: ((_a = response.data.transactionId) === null || _a === void 0 ? void 0 : _a.toString()) || ref,
                data: {
                    codes,
                    raw: response.data
                }
            };
        }
        catch (error) {
            console.error('Reloadly Purchase Error:', ((_b = error.response) === null || _b === void 0 ? void 0 : _b.data) || error.message);
            return {
                success: false,
                message: ((_d = (_c = error.response) === null || _c === void 0 ? void 0 : _c.data) === null || _d === void 0 ? void 0 : _d.message) || 'Failed to purchase gift card'
            };
        }
    }
    // Stub other methods as they are not for Reloadly (or at least strictly Gift Cards)
    async purchaseAirtime(network, phone, amount, ref) {
        throw new Error('Method not implemented.');
    }
    async purchaseData(network, phone, planCode, ref) {
        throw new Error('Method not implemented.');
    }
    async verifyElectricity(disco, meterNumber) {
        throw new Error('Method not implemented.');
    }
    async purchaseElectricity(disco, meterNumber, amount, ref) {
        throw new Error('Method not implemented.');
    }
    async verifyCable(provider, iuc) {
        throw new Error('Method not implemented.');
    }
    async purchaseCable(provider, iuc, planCode, ref) {
        throw new Error('Method not implemented.');
    }
    async purchaseGameTopup(gameId, playerId, packageId, ref) {
        throw new Error('Method not implemented.');
    }
    async purchaseEducationPin(examType, quantity, ref) {
        throw new Error('Method not implemented.');
    }
    async purchaseBettingWallet(customerId, amount, providerCode, ref) {
        throw new Error('Method not implemented.');
    }
    async printRechargeCard(network, amount, quantity, ref) {
        throw new Error('Method not implemented.');
    }
}
exports.ReloadlyProvider = ReloadlyProvider;
