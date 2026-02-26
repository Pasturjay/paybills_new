import axios from 'axios';
import { ProviderInterface, ProviderResponse } from '../services/provider.service';

interface ReloadlyAuthResponse {
    access_token: string;
    scope: string;
    expires_in: number;
    token_type: string;
}

export class ReloadlyProvider implements ProviderInterface {
    private clientId: string;
    private clientSecret: string;
    private audience: string;
    private mode: 'sandbox' | 'live';
    private accessToken: string | null = null;
    private tokenExpiry: number = 0;

    constructor() {
        this.clientId = process.env.RELOADLY_CLIENT_ID || '';
        this.clientSecret = process.env.RELOADLY_CLIENT_SECRET || '';
        this.mode = (process.env.RELOADLY_MODE as 'sandbox' | 'live') || 'sandbox';
        this.audience = this.mode === 'sandbox'
            ? 'https://giftcards-sandbox.reloadly.com'
            : 'https://giftcards.reloadly.com';
    }

    private get baseUrl() {
        return this.audience;
    }

    private async getAccessToken(): Promise<string> {
        if (this.accessToken && Date.now() < this.tokenExpiry) {
            return this.accessToken;
        }

        try {
            const response = await axios.post<ReloadlyAuthResponse>('https://auth.reloadly.com/oauth/token', {
                client_id: this.clientId,
                client_secret: this.clientSecret,
                grant_type: 'client_credentials',
                audience: this.audience
            });

            this.accessToken = response.data.access_token;
            // Set expiry 60 seconds before actual expiry to be safe
            this.tokenExpiry = Date.now() + (response.data.expires_in * 1000) - 60000;

            return this.accessToken;
        } catch (error) {
            console.error('Reloadly Auth Error:', error);
            throw new Error('Failed to authenticate with Reloadly');
        }
    }

    async purchaseGiftCard(brandId: string, amount: number, quantity: number, ref: string): Promise<ProviderResponse> {
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

            const response = await axios.post(`${this.baseUrl}/orders`, payload, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            // Extract codes from response
            // Reloadly structure varies slightly but usually contains transactionId and cards array
            const cards = response.data.cards || [];
            const codes = cards.map((card: any) => card.cardNumber || card.pinCode);

            return {
                success: true,
                reference: response.data.transactionId?.toString() || ref,
                data: {
                    codes,
                    raw: response.data
                }
            };

        } catch (error: any) {
            console.error('Reloadly Purchase Error:', error.response?.data || error.message);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to purchase gift card'
            };
        }
    }

    // Stub other methods as they are not for Reloadly (or at least strictly Gift Cards)
    async purchaseAirtime(network: string, phone: string, amount: number, ref: string): Promise<ProviderResponse> {
        throw new Error('Method not implemented.');
    }
    async purchaseData(network: string, phone: string, planCode: string, ref: string): Promise<ProviderResponse> {
        throw new Error('Method not implemented.');
    }
    async verifyElectricity(disco: string, meterNumber: string): Promise<ProviderResponse> {
        throw new Error('Method not implemented.');
    }
    async purchaseElectricity(disco: string, meterNumber: string, amount: number, ref: string): Promise<ProviderResponse> {
        throw new Error('Method not implemented.');
    }
    async verifyCable(provider: string, iuc: string): Promise<ProviderResponse> {
        throw new Error('Method not implemented.');
    }
    async purchaseCable(provider: string, iuc: string, planCode: string, ref: string): Promise<ProviderResponse> {
        throw new Error('Method not implemented.');
    }
    async purchaseGameTopup(gameId: string, playerId: string, packageId: string, ref: string): Promise<ProviderResponse> {
        throw new Error('Method not implemented.');
    }
    async purchaseEducationPin(examType: string, quantity: number, ref: string): Promise<ProviderResponse> {
        throw new Error('Method not implemented.');
    }
    async purchaseBettingWallet(customerId: string, amount: number, providerCode: string, ref: string): Promise<ProviderResponse> {
        throw new Error('Method not implemented.');
    }
    async printRechargeCard(network: string, amount: number, quantity: number, ref: string): Promise<ProviderResponse> {
        throw new Error('Method not implemented.');
    }
}
