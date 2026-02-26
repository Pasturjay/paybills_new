
import { ClubKonnectProvider } from '../providers/clubkonnect.provider';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const provider = new ClubKonnectProvider();

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
        } else {
            console.log('No plans found (check API key/network)');
        }

        // 4. Validate Meter (Mock/Test)
        // Skip actual purchase to save funds, but test validation if possible
        // console.log('\n--- Validate Meter ---');
        // const validation = await provider.validateElectricityMeter('01', '1234567890', 'PREPAID');
        // console.log(validation);

    } catch (error: any) {
        console.error('Test Error:', error.message);
    }
}

testClubKonnect();
