"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const clubkonnect_provider_1 = require("../providers/clubkonnect.provider");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
const provider = new clubkonnect_provider_1.ClubKonnectProvider();
async function testClubKonnect() {
    console.log('Testing ClubKonnect Provider...');
    try {
        // 1. Get Wallet Balance
        console.log('\n--- Wallet Balance ---');
        const balance = await provider.getWalletBalance();
        console.log(`Balance: ${balance}`);
        // 2. Get Airtime Providers
        console.log('\n--- Airtime Providers ---');
        const networks = await provider.getAirtimeProviders();
        console.log(networks);
        // 3. Get Data Plans (MTN)
        console.log('\n--- Data Plans (MTN) ---');
        const plans = await provider.getDataPlans('01');
        if (plans.length > 0) {
            console.log(`Found ${plans.length} plans. First plan:`, plans[0]);
        }
        else {
            console.log('No plans found (check API key/network)');
        }
        // 4. Validate Meter (Mock/Test)
        // Skip actual purchase to save funds, but test validation if possible
        // console.log('\n--- Validate Meter ---');
        // const validation = await provider.validateElectricityMeter('01', '1234567890', 'PREPAID');
        // console.log(validation);
    }
    catch (error) {
        console.error('Test Error:', error.message);
    }
}
testClubKonnect();
