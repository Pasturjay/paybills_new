import * as admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';

// Look for a local service account file first
const serviceAccountPath = path.resolve(__dirname, '../../firebase-service-account.json');

let serviceAccount: any;

if (fs.existsSync(serviceAccountPath)) {
    serviceAccount = require(serviceAccountPath);
} else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } catch (error: any) {
        console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT from process.env:', error.message);
        console.error('Raw ENV string starts with:', process.env.FIREBASE_SERVICE_ACCOUNT.substring(0, 20));
    }
}

if (!admin.apps.length) {
    if (serviceAccount) {
        try {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            console.log('✅ Firebase Admin SDK initialized successfully.');
        } catch (error: any) {
            console.error('❌ Firebase Admin initialization failed:', error.message);
        }
    } else {
        console.warn('⚠️ Firebase Admin SDK not initialized: No service account provided.');
    }
}

export const firebaseAdmin = admin;
export const auth = admin.auth();
