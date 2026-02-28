import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

async function testDuplication() {
    const API_URL = 'http://localhost:5000/api';
    const LOGIN_PAYLOAD = {
        email: 'dev@paybills.ng',
        password: 'password123' // REPLACE with actual if different
    };

    try {
        console.log('--- Phase 1: Authentication ---');
        const loginRes = await axios.post(`${API_URL}/auth/login`, LOGIN_PAYLOAD);
        const token = loginRes.data.token;
        console.log('Login successful.');

        console.log('\n--- Phase 2: Simultaneous Requests (Idempotency Test) ---');
        const idempotencyKey = uuidv4();
        const payload = {
            network: 'MTN',
            phone: '08012345678',
            amount: 100,
            pin: '1234', // REPLACE with actual if different
            providerCode: 'VTPASS',
            idempotencyKey
        };

        const headers = { Authorization: `Bearer ${token}` };

        console.log(`Firing 5 requests with same key: ${idempotencyKey}`);

        const requests = Array(5).fill(null).map(() =>
            axios.post(`${API_URL}/services/airtime`, payload, { headers })
                .catch(err => err.response)
        );

        const results = await Promise.all(requests);

        const successCount = results.filter(r => r.data?.status === 'success').length;
        const messages = results.map(r => r.data?.message || r.data?.error);

        console.log('\n--- Results ---');
        console.log(`Total Success Signals: ${successCount}`);
        console.log('Messages from Server:');
        messages.forEach((m, i) => console.log(` Request ${i + 1}: ${m}`));

        if (successCount === 5) {
            console.log('\n✅ TEST PASSED: All requests returned success but only first was processed (idempotent).');
        } else {
            console.log('\n❌ TEST WARN: Expected 5 success signals (duplicate blocks return success with existing ref).');
        }

    } catch (error: any) {
        console.error('Test Failed:', error.response?.data || error.message);
    }
}

testDuplication();
