"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiditService = void 0;
const axios_1 = __importDefault(require("axios"));
const prisma_1 = __importDefault(require("../prisma"));
class DiditService {
    constructor() {
        this.apiKey = process.env.DIDIT_API_KEY || '';
        this.workflowId = process.env.DIDIT_WORKFLOW_ID || '';
        this.baseUrl = process.env.DIDIT_BASE_URL || 'https://verification.didit.me/v3';
        this.webhookSecret = process.env.DIDIT_WEBHOOK_SECRET || '';
        if (!this.apiKey || !this.workflowId) {
            console.warn('DIDIT_API_KEY or DIDIT_WORKFLOW_ID is not set.');
        }
    }
    verifySignature(payload, signature) {
        if (!this.webhookSecret)
            return true; // Skip if no secret configured (dev mode)
        const crypto = require('crypto');
        const hmac = crypto.createHmac('sha256', this.webhookSecret);
        const digest = hmac.update(JSON.stringify(payload)).digest('hex');
        // Check both checks to be safe (some providers use base64, some hex)
        return signature === digest || signature === `sha256=${digest}`;
    }
    createSession(userId, email) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                // Find user first to ensure they exist
                const user = yield prisma_1.default.user.findUnique({
                    where: { id: userId },
                });
                if (!user) {
                    throw new Error('User not found');
                }
                const response = yield axios_1.default.post(`${this.baseUrl}/session/`, {
                    workflow_id: this.workflowId,
                    vendor_data: userId, // Using userId as vendor_data for tracking
                    callback: `${process.env.APP_URL || 'http://localhost:3000'}/api/kyc/callback`, // Callback URL
                    metadata: JSON.stringify({
                        email: email,
                        name: `${user.firstName} ${user.lastName}`
                    }),
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Api-Key': this.apiKey,
                    },
                });
                // Save the session ID to the user record
                yield prisma_1.default.user.update({
                    where: { id: userId },
                    data: {
                        // @ts-ignore
                        diditSessionId: response.data.session_id, // Adjust based on actual API response structure
                        // @ts-ignore
                        diditStatus: 'PENDING',
                    },
                });
                return response.data;
            }
            catch (error) {
                console.error('Error creating Didit session:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
                throw new Error(((_c = (_b = error.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.message) || 'Failed to create verification session');
            }
        });
    }
    verifySession(sessionId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const response = yield axios_1.default.get(`${this.baseUrl}/session/${sessionId}/decision`, {
                    headers: {
                        'X-Api-Key': this.apiKey,
                    },
                });
                return response.data;
            }
            catch (error) {
                console.error('Error fetching Didit session decision:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
                throw new Error('Failed to fetch verification status');
            }
        });
    }
    handleWebhook(payload) {
        return __awaiter(this, void 0, void 0, function* () {
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
                }
                else if (overallStatus === 'Declined' || overallStatus === 'Rejected') {
                    verificationStatus = 'REJECTED';
                }
                else if (overallStatus === 'ReviewNeeded' || overallStatus === 'ResubmissionNeeded') {
                    verificationStatus = 'NEEDS_ACTION';
                }
                const isVerified = verificationStatus === 'VERIFIED';
                // Find user by session_id explicitly, or fallback to vendor_data (userId)
                // Ideally we trust session_id mapping.
                const updateResult = yield prisma_1.default.user.updateMany({
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
                    yield prisma_1.default.user.update({
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
            }
            catch (error) {
                console.error('Error processing webhook:', error.message);
            }
        });
    }
}
exports.DiditService = DiditService;
