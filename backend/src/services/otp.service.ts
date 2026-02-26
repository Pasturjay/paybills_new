import { PrismaClient } from '@prisma/client';
import { EmailService } from './email.service';

const prisma = new PrismaClient();
const emailService = new EmailService();

export class OtpService {

    /**
     * Generates a random 6-digit OTP, stores it in the database, and sends it via Mailtrap.
     * @param identifier The user's email address
     * @returns A secure reference object to pass to the frontend
     */
    async requestOtp(identifier: string): Promise<string> {
        // 1. Generate a random 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        // 2. Generate a secure random reference string (UUID-like or simple random)
        const reference = `REF-${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Date.now()}`;

        // 3. Set expiration (e.g., 10 minutes from now)
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        // 4. Invalidate any previous unused OTPs for this identifier (optional but good practice)
        await prisma.otpCode.updateMany({
            where: {
                identifier,
                isUsed: false
            },
            data: {
                isUsed: true
            }
        });

        // 5. Save the new OTP securely in the Database
        await prisma.otpCode.create({
            data: {
                identifier,
                code,
                reference,
                expiresAt,
                isUsed: false
            }
        });

        // 6. Send the code via Mailtrap using the default Transactional generic template
        const subject = "Your Paybills Verification Code";
        const text = `Your verification code is: ${code}`;
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #4F46E5;">Paybills Verification</h2>
                <p>Please use the following 6-digit code to complete your registration:</p>
                <div style="margin: 20px 0; padding: 15px; background-color: #f3f4f6; border-radius: 8px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #111827;">
                    ${code}
                </div>
                <p style="color: #6b7280; font-size: 14px;">This code will expire in 10 minutes.</p>
                <br/>
                <p>Best regards,<br/><strong>The Paybills Team</strong></p>
            </div>
        `;

        await emailService.sendEmail(identifier, subject, text, html, "Authentication");

        return reference;
    }

    /**
     * Validates that the provided code matches the unexpired reference in the database.
     * @param reference The unique reference passed back from the frontend
     * @param code The 6-digit code entered by the user
     * @returns True if valid
     */
    async validateOtp(reference: string, code: string): Promise<boolean> {
        const otpRecord = await prisma.otpCode.findUnique({
            where: { reference }
        });

        // Basic validation checks
        if (!otpRecord) return false;
        if (otpRecord.isUsed) return false;
        if (otpRecord.code !== code) return false;
        if (new Date() > otpRecord.expiresAt) return false;

        // If it passes all checks, mark it as used so it cannot be reused
        await prisma.otpCode.update({
            where: { id: otpRecord.id },
            data: { isUsed: true }
        });

        return true;
    }
}
