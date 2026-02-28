
import axios from 'axios';

interface PaystackInitializeResponse {
    status: boolean;
    message: string;
    data: {
        authorization_url: string;
        access_code: string;
        reference: string;
    };
}

interface PaystackVerifyResponse {
    status: boolean;
    message: string;
    data: {
        status: string; // 'success', 'failed', 'abandoned'
        reference: string;
        amount: number; // in kobo
        gateway_response: string;
        channel: string;
        customer: {
            email: string;
        };
    };
}

export class PaystackService {
    private secretKey: string;
    private baseUrl: string = 'https://api.paystack.co';

    constructor() {
        this.secretKey = process.env.PAYSTACK_SECRET_KEY || '';
        if (!this.secretKey) {
            console.warn('PAYSTACK_SECRET_KEY is not set.');
        }
    }

    async initializeTransaction(email: string, amount: number, callbackUrl: string, metadata: any = {}): Promise<PaystackInitializeResponse['data']> {
        try {
            // Amount in Kobo
            const amountInKobo = Math.round(amount * 100);

            const response = await axios.post<PaystackInitializeResponse>(
                `${this.baseUrl}/transaction/initialize`,
                {
                    email,
                    amount: amountInKobo,
                    callback_url: callbackUrl,
                    metadata: metadata,
                    channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer']
                },
                {
                    headers: {
                        Authorization: `Bearer ${this.secretKey}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.data.status) {
                throw new Error(response.data.message || 'Failed to initialize transaction');
            }

            return response.data.data;
        } catch (error: any) {
            console.error('Paystack Initialize Error:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Paystack initialization failed');
        }
    }

    async verifyTransaction(reference: string): Promise<PaystackVerifyResponse['data']> {
        try {
            const response = await axios.get<PaystackVerifyResponse>(
                `${this.baseUrl}/transaction/verify/${reference}`,
                {
                    headers: {
                        Authorization: `Bearer ${this.secretKey}`,
                    },
                }
            );

            if (!response.data.status) {
                throw new Error(response.data.message || 'Verification failed');
            }

            return response.data.data;
        } catch (error: any) {
            console.error('Paystack Verify Error:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Paystack verification failed');
        }
    }

    async createDedicatedAccount(email: string, firstName: string, lastName: string, phone: string): Promise<any> {
        try {
            // 1. Create or Fetch Customer
            let customerCode;
            try {
                const customerResponse = await axios.post(
                    `${this.baseUrl}/customer`,
                    { email, first_name: firstName, last_name: lastName, phone },
                    { headers: { Authorization: `Bearer ${this.secretKey}` } }
                );
                customerCode = customerResponse.data.data.customer_code;
            } catch (err: any) {
                // If customer exists, we might get an error or we might need to fetch. 
                // For simplicity, if creation fails, try to fetch or assume existing logic if needed.
                // But Paystack create customer is usually idempotent or returns existing.
                // Let's assume we proceed or handle "Customer already exists" by fetching.
                if (err.response?.data?.message === "Customer already exists") {
                    // We need to fetch the customer code. 
                    // For now, let's assume we can fetch by email
                    const fetchResponse = await axios.get(
                        `${this.baseUrl}/customer/${email}`,
                        { headers: { Authorization: `Bearer ${this.secretKey}` } }
                    );
                    customerCode = fetchResponse.data.data.customer_code;
                } else {
                    throw err;
                }
            }

            // 2. Create Dedicated Account
            const dvaResponse = await axios.post(
                `${this.baseUrl}/dedicated_account`,
                {
                    customer: customerCode,
                    preferred_bank: "wema-bank",
                    metadata: { type: 'funding' }
                },
                { headers: { Authorization: `Bearer ${this.secretKey}` } }
            );

            return dvaResponse.data.data;

        } catch (error: any) {
            console.error('Paystack DVA Error:', error.response?.data || error.message);
            // Verify if it's already assigned
            throw new Error(error.response?.data?.message || 'Failed to create dedicated account');
        }
    }
}
