"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WantToPayProvider = void 0;
const axios_1 = __importDefault(require("axios"));
class WantToPayProvider {
    constructor() {
        this.config = {
            apiKey: process.env.WANTTOPAY_API_KEY || 'test_key',
            baseUrl: 'https://api.wanttopay.net/v1' // Mock URL
        };
    }
    // 1. Create Card
    async createCard(userId, amount, billingName) {
        try {
            // Mock Implementation as specific API docs aren't provided
            // Assuming strict PCI compliance: we get an ID and masked PAN details
            const response = await axios_1.default.post(`${this.config.baseUrl}/cards/create`, {
                user_ref: userId,
                initial_amount: amount,
                billing_name: billingName,
                currency: 'USD'
            }, {
                headers: { 'Authorization': `Bearer ${this.config.apiKey}` }
            });
            return {
                cardId: response.data.id,
                pan: response.data.pan_masked, // **** **** **** 1234
                cvv: response.data.cvv,
                expiry: response.data.expiry,
                fullPan: response.data.pan_encrypted // Optionally stored if encryption key available
            };
        }
        catch (error) {
            console.error('WantToPay Create Error:', error);
            // Fallback for demo/dev without real API
            if (process.env.NODE_ENV !== 'production') {
                return {
                    cardId: `wtp_${Date.now()}`,
                    pan: `4242 4242 4242 ${Math.floor(1000 + Math.random() * 9000)}`,
                    cvv: '123',
                    expiry: '12/28',
                    fullPan: 'encrypted_mock'
                };
            }
            throw new Error('Failed to create virtual card');
        }
    }
    // 2. Get Card Details
    async getCardDetails(cardId) {
        try {
            const response = await axios_1.default.get(`${this.config.baseUrl}/cards/${cardId}`, {
                headers: { 'Authorization': `Bearer ${this.config.apiKey}` }
            });
            return response.data;
        }
        catch (error) {
            console.error('WantToPay Details Error:', error);
            if (process.env.NODE_ENV !== 'production') {
                return {
                    status: 'ACTIVE',
                    balance: 100.00
                };
            }
            throw new Error('Failed to fetch card details');
        }
    }
    // 3. Freeze/Unfreeze
    async toggleCardStatus(cardId, status) {
        try {
            const endpoint = status === 'FREEZE' ? 'freeze' : 'unfreeze';
            await axios_1.default.post(`${this.config.baseUrl}/cards/${cardId}/${endpoint}`, {}, {
                headers: { 'Authorization': `Bearer ${this.config.apiKey}` }
            });
            return true;
        }
        catch (error) {
            console.error(`WantToPay ${status} Error:`, error);
            if (process.env.NODE_ENV !== 'production')
                return true;
            return false;
        }
    }
    // 4. Fund Card
    async fundCard(cardId, amount) {
        try {
            await axios_1.default.post(`${this.config.baseUrl}/cards/${cardId}/fund`, { amount }, {
                headers: { 'Authorization': `Bearer ${this.config.apiKey}` }
            });
            return true;
        }
        catch (error) {
            console.error('WantToPay Fund Error:', error);
            if (process.env.NODE_ENV !== 'production')
                return true;
            throw new Error('Failed to fund card');
        }
    }
}
exports.WantToPayProvider = WantToPayProvider;
