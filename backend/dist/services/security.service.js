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
exports.SecurityService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = __importDefault(require("../prisma"));
class SecurityService {
    /**
     * Set a new Transaction PIN for the user
     */
    setPin(userId, pin) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!/^\d{4}$/.test(pin)) {
                throw new Error('PIN must be exactly 4 digits');
            }
            const hashedPin = yield bcryptjs_1.default.hash(pin, 10);
            yield prisma_1.default.user.update({
                where: { id: userId },
                data: { transactionPin: hashedPin }
            });
        });
    }
    /**
     * Verify Transaction PIN
     */
    verifyPin(userId, pin) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield prisma_1.default.user.findUnique({
                where: { id: userId },
                select: { transactionPin: true }
            });
            if (!user || !user.transactionPin) {
                throw new Error('PIN not set. Please set a transaction PIN first.');
            }
            return bcryptjs_1.default.compare(pin, user.transactionPin);
        });
    }
    /**
     * Middleware helper to validate PIN in requests
     */
    validateRequestPin(userId, pin) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!pin)
                throw new Error('Transaction PIN is required');
            const isValid = yield this.verifyPin(userId, pin);
            if (!isValid) {
                throw new Error('Invalid Transaction PIN');
            }
        });
    }
}
exports.SecurityService = SecurityService;
