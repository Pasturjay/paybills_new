import dotenv from 'dotenv';
dotenv.config();

export const clubKonnectConfig = {
    BASE_URL: process.env.CLUBKONNECT_BASE_URL || 'https://www.clubkonnect.com/API',
    API_KEY: process.env.CLUBKONNECT_API_KEY || '',
    USER_ID: process.env.CLUBKONNECT_USER_ID || '', // Some APIs require UserID + APIKey
};

if (!clubKonnectConfig.API_KEY) {
    console.warn("WARNING: ClubKonnect API Key is missing in environment variables.");
}
