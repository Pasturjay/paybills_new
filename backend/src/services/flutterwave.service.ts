
import axios from 'axios';

interface FlutterwaveVirtualAccountResponse {
    status: string;
    message: string;
    data: {
        response_code: string;
        response_message: string;
        flw_ref: string;
        order_ref: string;
        account_number: string;
        account_status: string;
        frequency: string;
        bank_name: string;
        created_at: string;
        expiry_date: string;
        note: string;
        amount: number;
    }
}

interface FlutterwavePaymentResponse {
    status: string;
    message: string;
    data: {
        link: string;
    };
}

interface FlutterwaveVerifyResponse {
    status: string;
    message: string;
    data: {
        id: number;
        tx_ref: string;
        flw_ref: string;
        status: string; // 'successful', 'failed', 'pending'
        amount: number;
        currency: string;
        charged_amount: number;
        customer: {
            email: string;
            name: string;
        };
        meta: any;
    };
}

export class FlutterwaveService {
    private secretKey: string;
    private publicKey: string;
    private encryptionKey: string;
    private baseUrl: string = 'https://api.flutterwave.com/v3';

    constructor() {
        this.secretKey = process.env.FLUTTERWAVE_SECRET_KEY || '';
        this.publicKey = process.env.FLUTTERWAVE_PUBLIC_KEY || '';
        this.encryptionKey = process.env.FLUTTERWAVE_ENCRYPTION_KEY || '';
        if (!this.secretKey) {
            console.warn('FLUTTERWAVE_SECRET_KEY is not set.');
        }
    }

    /**
     * Initialize a payment via Flutterwave Standard (hosted checkout)
     */
    async initializeTransaction(
        email: string,
        amount: number,
        txRef: string,
        redirectUrl: string,
        metadata: Record<string, any> = {}
    ): Promise<{ link: string; tx_ref: string }> {
        try {
            const response = await axios.post<FlutterwavePaymentResponse>(
                `${this.baseUrl}/payments`,
                {
                    tx_ref: txRef,
                    amount,
                    currency: 'NGN',
                    redirect_url: redirectUrl,
                    customer: { email },
                    meta: metadata,
                    customizations: {
                        title: 'PayBills',
                        description: 'Wallet Funding via Flutterwave',
                        logo: 'https://paybills.ng/logo.png'
                    }
                },
                {
                    headers: {
                        Authorization: `Bearer ${this.secretKey}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.data.status !== 'success') {
                throw new Error(response.data.message || 'Failed to initialize payment');
            }

            return { link: response.data.data.link, tx_ref: txRef };
        } catch (error: any) {
            console.error('Flutterwave Init Error:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Flutterwave payment initialization failed');
        }
    }

    /**
     * Verify a transaction by its Flutterwave transaction ID
     */
    async verifyTransaction(transactionId: string): Promise<FlutterwaveVerifyResponse['data']> {
        try {
            const response = await axios.get<FlutterwaveVerifyResponse>(
                `${this.baseUrl}/transactions/${transactionId}/verify`,
                {
                    headers: {
                        Authorization: `Bearer ${this.secretKey}`,
                    },
                }
            );

            if (response.data.status !== 'success') {
                throw new Error(response.data.message || 'Verification failed');
            }

            return response.data.data;
        } catch (error: any) {
            console.error('Flutterwave Verify Error:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Flutterwave verification failed');
        }
    }

    /**
     * Verify webhook signature using the secret hash
     * Flutterwave sends a `verif-hash` header that must match FLUTTERWAVE_SECRET_KEY
     */
    verifyWebhookSignature(verifHash: string): boolean {
        return verifHash === this.secretKey;
    }

    /**
     * Create a permanent virtual account number (Flutterwave)
     */
    async createVirtualAccount(email: string, bvn: string, txRef: string, firstName: string, lastName: string, phoneNumber: string) {
        try {
            // Validate BVN requirement (Flutterwave often requires it for virtual accounts)
            if (!bvn) {
                throw new Error('BVN is required for Flutterwave Virtual Accounts');
            }

            const response = await axios.post<FlutterwaveVirtualAccountResponse>(
                `${this.baseUrl}/virtual-account-numbers`,
                {
                    email,
                    is_permanent: true,
                    bvn,
                    tx_ref: txRef,
                    phonenumber: phoneNumber,
                    firstname: firstName,
                    lastname: lastName,
                    narration: `${firstName} ${lastName}`
                },
                {
                    headers: {
                        Authorization: `Bearer ${this.secretKey}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.data.status !== 'success') {
                throw new Error(response.data.message || 'Failed to create virtual account');
            }

            return response.data.data;
        } catch (error: any) {
            console.error('Flutterwave VA Error:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Flutterwave virtual account creation failed');
        }
    }
}
