"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
// Load env vars
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
const prisma = new client_1.PrismaClient();
const API_URL = process.env.APP_URL || 'http://localhost:3000';
const JWT_SECRET = process.env.JWT_SECRET || 'changeme_in_production';
async function testKYCFlow() {
    var _a, _b;
    console.log('Testing KYC Flow...');
    let testUser;
    try {
        // 1. Create Test User
        console.log('\n--- Creating Test User ---');
        const email = `test.kyc.${Date.now()}@example.com`;
        testUser = await prisma.user.create({
            data: {
                email: email,
                phone: `+234${Date.now().toString().slice(-10)}`,
                password: 'hashed_password_placeholder',
                firstName: 'Test',
                lastName: 'User',
                role: 'USER'
            }
        });
        console.log(`User created: ${testUser.id}`);
        // 2. Generate Token
        const token = jsonwebtoken_1.default.sign({ id: testUser.id, role: testUser.role }, JWT_SECRET, { expiresIn: '1h' });
        console.log('Token generated.');
        // 3. Initiate KYC
        console.log('\n--- Initiating KYC ---');
        // Note: This will fail if DIDIT_API_KEY is dummy, but we expect a 400 or 500 from the service, not 401.
        // However, the test script should handle the mocked service response if we were mocking it. 
        // Since we are hitting a real server which calls real Didit API, we expect it to fail if keys are invalid.
        try {
            const initiateResponse = await axios_1.default.post(`${API_URL}/api/kyc/initiate`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log('Status:', initiateResponse.status);
            console.log('Response:', initiateResponse.data);
        }
        catch (e) {
            console.log('Initiate KYC failed (Expected if keys are invalid):', (_a = e.response) === null || _a === void 0 ? void 0 : _a.status, (_b = e.response) === null || _b === void 0 ? void 0 : _b.data);
        }
        // 4. Test Webhook (can run independently of Didit success)
        console.log('\n--- Simulating Webhook ---');
        // We can simulate updating this user
        const webhookPayload = {
            session_id: 'fake_session_id', // This won't match unless we update user manually
            decision: 'Approved',
        };
        // Manually set session id to verify webhook logic matches
        await prisma.user.update({
            where: { id: testUser.id },
            data: { diditSessionId: 'fake_session_id' }
        });
        const webhookResponse = await axios_1.default.post(`${API_URL}/api/kyc/webhook`, webhookPayload);
        console.log('Webhook Status:', webhookResponse.status);
        // Verify DB update
        const updatedUser = await prisma.user.findUnique({ where: { id: testUser.id } });
        console.log('User Status after webhook:', updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.diditStatus);
        console.log('User Verified:', updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.isVerified);
    }
    catch (error) {
        console.error('Test failed:', error.message);
    }
    finally {
        // Cleanup
        if (testUser) {
            console.log('\n--- Cleaning up ---');
            await prisma.user.delete({ where: { id: testUser.id } });
        }
        await prisma.$disconnect();
    }
}
testKYCFlow();
