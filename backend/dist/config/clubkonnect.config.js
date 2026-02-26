"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clubKonnectConfig = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.clubKonnectConfig = {
    BASE_URL: process.env.CLUBKONNECT_BASE_URL || 'https://www.clubkonnect.com/API',
    API_KEY: process.env.CLUBKONNECT_API_KEY || '',
    USER_ID: process.env.CLUBKONNECT_USER_ID || '', // Some APIs require UserID + APIKey
};
if (!exports.clubKonnectConfig.API_KEY) {
    console.warn("WARNING: ClubKonnect API Key is missing in environment variables.");
}
