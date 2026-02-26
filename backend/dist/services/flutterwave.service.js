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
exports.FlutterwaveService = void 0;
const axios_1 = __importDefault(require("axios"));
class FlutterwaveService {
    constructor() {
        this.baseUrl = 'https://api.flutterwave.com/v3';
        this.secretKey = process.env.FLUTTERWAVE_SECRET_KEY || '';
        if (!this.secretKey) {
            console.warn('FLUTTERWAVE_SECRET_KEY is not set.');
        }
    }
    createVirtualAccount(email, bvn, txRef, firstName, lastName, phoneNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                // Validate BVN requirement (Flutterwave often requires it for virtual accounts)
                if (!bvn) {
                    throw new Error('BVN is required for Flutterwave Virtual Accounts');
                }
                const response = yield axios_1.default.post(`${this.baseUrl}/virtual-account-numbers`, {
                    email,
                    is_permanent: true,
                    bvn,
                    tx_ref: txRef,
                    phonenumber: phoneNumber,
                    firstname: firstName,
                    lastname: lastName,
                    narration: `${firstName} ${lastName}`
                }, {
                    headers: {
                        Authorization: `Bearer ${this.secretKey}`,
                        'Content-Type': 'application/json',
                    },
                });
                if (response.data.status !== 'success') {
                    throw new Error(response.data.message || 'Failed to create virtual account');
                }
                return response.data.data;
            }
            catch (error) {
                console.error('Flutterwave VA Error:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
                throw new Error(((_c = (_b = error.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.message) || 'Flutterwave virtual account creation failed');
            }
        });
    }
}
exports.FlutterwaveService = FlutterwaveService;
