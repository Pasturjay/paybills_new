
import axios from 'axios';
import prisma from '../prisma';

export class DiditService {
    private apiKey: string;
    private workflowId: string;
    private baseUrl: string;
    private webhookSecret: string;

    constructor() {
        this.apiKey = process.env.DIDIT_API_KEY || '';
        this.workflowId = process.env.DIDIT_WORKFLOW_ID || '';
        this.baseUrl = process.env.DIDIT_BASE_URL || 'https://verification.didit.me/v3';
        this.webhookSecret = process.env.DIDIT_WEBHOOK_SECRET || '';

        if (!this.apiKey || !this.workflowId) {
            console.warn('DIDIT_API_KEY or DIDIT_WORKFLOW_ID is not set.');
        }
    }

    verifySignature(payload: any, signature: string): boolean {
        if (!this.webhookSecret) return true; // Skip if no secret configured (dev mode)
        const crypto = require('crypto');
        const hmac = crypto.createHmac('sha256', this.webhookSecret);
        const digest = hmac.update(JSON.stringify(payload)).digest('hex');
        // Check both checks to be safe (some providers use base64, some hex)
        return signature === digest || signature === `sha256=${digest}`;
    }

    async createSession(userId: string, email: string) {
        try {
            // Find user first to ensure they exist
            const user = await prisma.user.findUnique({
                where: { id: userId },
            });

            if (!user) {
                throw new Error('User not found');
            }

            const response = await axios.post(
                `${this.baseUrl}/session/`,
                {
                    workflow_id: this.workflowId,
                    vendor_data: userId, // Using userId as vendor_data for tracking
                    callback: `${process.env.APP_URL || 'http://localhost:3000'}/api/kyc/callback`, // Callback URL
                    metadata: JSON.stringify({
                        email: email,
                        name: `${user.firstName} ${user.lastName}`
                    }),
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Api-Key': this.apiKey,
                    },
                }
            );

            // Save the session ID to the user record
            await prisma.user.update({
                where: { id: userId },
                data: {
                    // @ts-ignore
                    diditSessionId: response.data.session_id, // Adjust based on actual API response structure
                    // @ts-ignore
                    diditStatus: 'PENDING',
                },
            });

            return response.data;
        } catch (error: any) {
            console.error('Error creating Didit session:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Failed to create verification session');
        }
    }

    async verifySession(sessionId: string) {
        try {
            const response = await axios.get(
                `${this.baseUrl}/session/${sessionId}/decision`,
                {
                    headers: {
                        'X-Api-Key': this.apiKey,
                    },
                }
            );

            return response.data;
        } catch (error: any) {
            console.error('Error fetching Didit session decision:', error.response?.data || error.message);
            throw new Error('Failed to fetch verification status');
        }
    }

    async handleWebhook(payload: any) {
        // Updated based on provided payload structure
        console.log('Received Didit Webhook:', JSON.stringify(payload, null, 2));

        const { session_id: sessionId, status: overallStatus, decision, vendor_data: userId } = payload;

        if (!sessionId || !overallStatus) {
            console.warn('Invalid webhook payload: Missing sessionId or status');
            return;
        }

        try {
            // "Approved" | "Declined" | "ReviewNeeded" -> Map to our statuses
            // The payload shows "Approved"
            let verificationStatus = 'PENDING';
            let kycLevel = 0;

            if (overallStatus === 'Approved') {
                verificationStatus = 'VERIFIED';
                kycLevel = 2;
            } else if (overallStatus === 'Declined' || overallStatus === 'Rejected') {
                verificationStatus = 'REJECTED';
            } else if (overallStatus === 'ReviewNeeded' || overallStatus === 'ResubmissionNeeded') {
                verificationStatus = 'NEEDS_ACTION';
            }

            const isVerified = verificationStatus === 'VERIFIED';

            // Find user by session_id explicitly, or fallback to vendor_data (userId)
            // Ideally we trust session_id mapping.
            const updateResult = await prisma.user.updateMany({
                where: {
                    // @ts-ignore
                    diditSessionId: sessionId
                },
                data: {
                    // @ts-ignore
                    diditStatus: overallStatus, // Keep raw status from provider
                    isVerified: isVerified,
                    kycLevel: isVerified ? 2 : 0, // Logic for level upgrade
                    // We could also store the full decision object in a separate table or JSON field if needed
                }
            });

            if (updateResult.count === 0 && userId) {
                // Fallback: try to update by userId if session ID was somehow lost or mismatched (though unlikely if flow is correct)
                console.log(`Could not find user by session ${sessionId}, trying vendor_data/userId: ${userId}`);
                await prisma.user.update({
                    where: { id: userId },
                    data: {
                        // @ts-ignore
                        diditSessionId: sessionId, // Sync it back
                        // @ts-ignore
                        diditStatus: overallStatus,
                        isVerified: isVerified,
                        kycLevel: isVerified ? 2 : 0,
                    }
                });
            }

            console.log(`Processed Webhook for Session ${sessionId}: Status=${overallStatus}`);
        } catch (error: any) {
            console.error('Error processing webhook:', error.message);
        }
    }
}
