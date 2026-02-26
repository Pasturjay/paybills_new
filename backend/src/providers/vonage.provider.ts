import axios from 'axios';
import crypto from 'crypto';

interface VonageConfig {
    apiKey: string;
    apiSecret: string;
    baseUrl: string;
}

export class VonageProvider {
    private config: VonageConfig;

    constructor() {
        this.config = {
            apiKey: process.env.VONAGE_API_KEY || 'test_key',
            apiSecret: process.env.VONAGE_API_SECRET || 'test_secret',
            baseUrl: 'https://rest.nexmo.com'
        };
    }

    // 1. Search Available Numbers
    async searchNumbers(countryCode: string): Promise<any[]> {
        try {
            const response = await axios.get(`${this.config.baseUrl}/number/search`, {
                params: {
                    api_key: this.config.apiKey,
                    api_secret: this.config.apiSecret,
                    country: countryCode,
                    features: 'SMS' // We want SMS enabled numbers
                }
            });

            if (response.data.numbers) {
                return response.data.numbers.map((n: any) => ({
                    msisdn: n.msisdn,
                    cost: n.cost,
                    type: n.type,
                    features: n.features
                }));
            }
            return [];
        } catch (error) {
            console.error('Vonage Search Error:', error);
            throw new Error('Failed to search numbers');
        }
    }

    // 2. Rent Number
    async rentNumber(countryCode: string, msisdn: string): Promise<{ status: string, msisdn: string }> {
        try {
            const response = await axios.post(`${this.config.baseUrl}/number/buy`, new URLSearchParams({
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
        } catch (error: any) {
            console.error('Vonage Rent Error:', error.response?.data || error.message);
            throw new Error('Failed to rent number: ' + (error.response?.data?.['error-code-label'] || error.message));
        }
    }

    // 3. Cancel Number
    async cancelNumber(countryCode: string, msisdn: string) {
        try {
            const response = await axios.post(`${this.config.baseUrl}/number/cancel`, new URLSearchParams({
                api_key: this.config.apiKey,
                api_secret: this.config.apiSecret,
                country: countryCode,
                msisdn: msisdn
            }));

            if (response.data['error-code'] && response.data['error-code'] !== '200') {
                throw new Error(`Vonage Error: ${response.data['error-code-label']}`);
            }

            return true;
        } catch (error) {
            console.error('Vonage Cancel Error:', error);
            // Don't throw for cancellation if possible, logs sufficient for audit
            return false;
        }
    }

    // 4. Verify Webhook Signature (Inbound SMS)
    // Vonage signs using HMAC-SHA256 usually if confident configured, or MD5
    verifySignature(params: any): boolean {
        // Simplified check: In production, verify actual signature from headers or query params
        // For now, check if message has basic fields
        if (!params.msisdn || !params.to || !params.text) return false;
        return true;
    }
}
