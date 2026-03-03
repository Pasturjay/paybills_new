import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // Must be 32 characters
const IV_LENGTH = 12; // Recommended for GCM
const AUTH_TAG_LENGTH = 16;

export class EncryptionService {
    private key: Buffer;

    constructor() {
        if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 32) {
            console.warn('ENCRYPTION_KEY must be a 32-character string. Falling back to insecure key for initialization.');
            this.key = Buffer.alloc(32, ENCRYPTION_KEY || 'insecure_fallback_key_32_chars_!');
        } else {
            this.key = Buffer.from(ENCRYPTION_KEY);
        }
    }

    encrypt(text: string): string {
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv(ALGORITHM, this.key, iv);

        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        const authTag = cipher.getAuthTag().toString('hex');

        // Structure: iv:authTag:encryptedContent
        return `${iv.toString('hex')}:${authTag}:${encrypted}`;
    }

    decrypt(encryptedData: string): string {
        const [ivHex, authTagHex, encryptedText] = encryptedData.split(':');

        if (!ivHex || !authTagHex || !encryptedText) {
            throw new Error('Invalid encrypted data format');
        }

        const iv = Buffer.from(ivHex, 'hex');
        const authTag = Buffer.from(authTagHex, 'hex');
        const decipher = crypto.createDecipheriv(ALGORITHM, this.key, iv);

        decipher.setAuthTag(authTag);

        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    }
}

export const encryptionService = new EncryptionService();
