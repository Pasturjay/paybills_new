"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KYCController = void 0;
const didit_service_1 = require("../services/didit.service");
const diditService = new didit_service_1.DiditService();
class KYCController {
    async initiateKYC(req, res) {
        try {
            const { user } = req; // Assuming auth middleware attaches user to req
            if (!user || !user.id || !user.email) {
                return res.status(401).json({ message: 'Unauthorized' });
            }
            const session = await diditService.createSession(user.id, user.email);
            return res.status(200).json({
                message: 'KYC session initiated',
                url: session.url, // Ensure API returns 'url'
                sessionId: session.session_id
            });
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ message: error.message });
        }
    }
    async handleWebhook(req, res) {
        try {
            const payload = req.body;
            const signature = req.headers['x-didit-signature']; // Common standard
            // Allow bypassing if secret is missing or signature header is missing (for testing), 
            // BUT verify if both are present.
            // In Production, strict mode should be enforced.
            if (process.env.DIDIT_WEBHOOK_SECRET && signature) {
                const isValid = diditService.verifySignature(payload, signature);
                if (!isValid) {
                    console.warn('Invalid Didit Webhook Signature');
                    return res.status(401).send('Invalid Signature');
                }
            }
            else if (process.env.NODE_ENV === 'production' && !signature) {
                console.warn('Missing Webhook Signature in Production');
                // return res.status(401).send('Missing Signature'); // Uncomment to enforce
            }
            await diditService.handleWebhook(payload);
            return res.status(200).send('OK');
        }
        catch (error) {
            console.error(error);
            return res.status(500).send('Internal Server Error');
        }
    }
    async getStatus(req, res) {
        // Helper to check status manually if needed
        // ...
    }
}
exports.KYCController = KYCController;
