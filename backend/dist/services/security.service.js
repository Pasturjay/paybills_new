"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = __importDefault(require("../prisma"));
class SecurityService {
    /**
     * Set a new Transaction PIN for the user
     */
    async setPin(userId, pin) {
        if (!/^\d{4}$/.test(pin)) {
            throw new Error('PIN must be exactly 4 digits');
        }
        const hashedPin = await bcryptjs_1.default.hash(pin, 8);
        await prisma_1.default.user.update({
            where: { id: userId },
            data: { transactionPin: hashedPin }
        });
    }
    /**
     * Verify Transaction PIN
     */
    async verifyPin(userId, pin) {
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
            select: { transactionPin: true }
        });
        if (!user || !user.transactionPin) {
            throw new Error('PIN not set. Please set a transaction PIN first.');
        }
        return bcryptjs_1.default.compare(pin, user.transactionPin);
    }
    /**
     * Middleware helper to validate PIN in requests
     */
    async validateRequestPin(userId, pin) {
        if (!pin)
            throw new Error('Transaction PIN is required');
        const isValid = await this.verifyPin(userId, pin);
        if (!isValid) {
            throw new Error('Invalid Transaction PIN');
        }
    }
}
exports.SecurityService = SecurityService;
