
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

export class FlutterwaveService {
    private secretKey: string;
    private baseUrl: string = 'https://api.flutterwave.com/v3';

    constructor() {
        this.secretKey = process.env.FLUTTERWAVE_SECRET_KEY || '';
        if (!this.secretKey) {
            console.warn('FLUTTERWAVE_SECRET_KEY is not set.');
        }
    }

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

    // Webhook verification would go here
}
