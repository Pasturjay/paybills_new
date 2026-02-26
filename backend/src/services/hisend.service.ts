import axios from 'axios';

const HISEND_API_BASE = 'https://core.hisend.hunnovate.com/api/v1';

export class HisendService {
    private apiKey: string;

    constructor() {
        this.apiKey = process.env.HISEND_API_KEY || '';
        if (!this.apiKey) {
            console.warn('HISEND_API_KEY environment variable is not set. OTP features will fail.');
        }
    }

    /**
     * Send an OTP to a user via email or SMS.
     * @param identifier The user's email or phone number in international format (e.g., 23480...)
     * @param channel The delivery channel: 'email' or 'sms'
     * @returns The OTP reference string needed for validation
     */
    async sendOtp(identifier: string, channel: 'email' | 'sms' = 'email'): Promise<string> {
        try {
            const response = await axios.get(`${HISEND_API_BASE}/otp/send`, {
                params: {
                    api_key: this.apiKey,
                    customer_identifier: identifier,
                    channel: channel,
                    length: 6,
                    expiry: 10
                }
            });

            // Expected response format according to standard API structures:
            // { status: true, data: { reference: "..." } } or similar
            // Adjust based on exact HiSend response payload if it differs.
            if (response.data && response.data.data && response.data.data.reference) {
                return response.data.data.reference;
            } else if (response.data && response.data.reference) {
                return response.data.reference;
            } else if (response.data && response.data.otp_reference) {
                return response.data.otp_reference;
            } else if (response.data && response.data.data && response.data.data.otp_reference) {
                return response.data.data.otp_reference;
            }

            throw new Error('OTP reference not found in HiSend response');
        } catch (error: any) {
            console.error('HiSend API Error (Send OTP):', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Failed to send OTP via HiSend');
        }
    }

    /**
     * Validate an OTP provided by the user against the reference.
     * @param reference The reference returned from sendOtp
     * @param otp The code inputted by the user
     * @returns Boolean indicating whether validation was successful
     */
    async validateOtp(reference: string, otp: string): Promise<boolean> {
        try {
            const response = await axios.get(`${HISEND_API_BASE}/otp/validate`, {
                params: {
                    api_key: this.apiKey,
                    reference: reference,
                    otp: otp
                }
            });

            // Adjust based on standard successful validation response.
            // Often returns 200 OK or a success boolean in the body.
            if (response.status === 200 || response.data?.status === true || response.data?.success === true) {
                return true;
            }

            return false;
        } catch (error: any) {
            console.error('HiSend API Error (Validate OTP):', error.response?.data || error.message);
            // If the API returns a 400 or 404 for an invalid OTP, catch it here and return false
            if (error.response && (error.response.status === 400 || error.response.status === 404)) {
                return false;
            }
            throw new Error('An error occurred while validating the OTP');
        }
    }
}
