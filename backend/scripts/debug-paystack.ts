import { config } from 'dotenv';
config();
import { PaystackService } from '../src/services/paystack.service';

const run = async () => {
    const service = new PaystackService();
    try {
        console.log('Testing Paystack Initialization...');
        const email = 'test@example.com';
        const amount = 5000; // 5000 Naira
        const callbackUrl = 'http://localhost:3000/verify';

        console.log(`Email: ${email}, Amount: ${amount}, Callback: ${callbackUrl}`);

        const res = await service.initializeTransaction(email, amount, callbackUrl);
        console.log('Success:', res);
    } catch (error: any) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Paystack Response:', error.response.data);
        }
    }
};

run();
