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
    } catch (error) {
        console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT from process.env');
    }
}

if (!admin.apps.length) {
    if (serviceAccount) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log('Firebase Admin SDK initialized successfully.');
    } else {
        console.warn('Firebase Admin SDK not initialized: No service account provided.');
    }
}

export const firebaseAdmin = admin;
export const auth = admin.auth();
