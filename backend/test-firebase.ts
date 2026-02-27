import { auth } from './src/config/firebase.config';

async function testFirebase() {
    console.log('Testing Firebase Admin initialization...');
    try {
        // Try a simple operation that requires initialization
        const result = await auth.createCustomToken('test-uid');
        console.log('✅ Firebase Admin works! Custom token generated.');
    } catch (error: any) {
        console.error('❌ Firebase Admin test failed:', error.message);
    }
}

testFirebase();
