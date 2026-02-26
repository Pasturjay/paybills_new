import bcrypt from 'bcryptjs';
import prisma from '../prisma';

export class SecurityService {

    /**
     * Set a new Transaction PIN for the user
     */
    async setPin(userId: string, pin: string): Promise<void> {
        if (!/^\d{4}$/.test(pin)) {
            throw new Error('PIN must be exactly 4 digits');
        }

        const hashedPin = await bcrypt.hash(pin, 10);

        await prisma.user.update({
            where: { id: userId },
            data: { transactionPin: hashedPin }
        });
    }

    /**
     * Verify Transaction PIN
     */
    async verifyPin(userId: string, pin: string): Promise<boolean> {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { transactionPin: true }
        });

        if (!user || !user.transactionPin) {
            throw new Error('PIN not set. Please set a transaction PIN first.');
        }

        return bcrypt.compare(pin, user.transactionPin);
    }

    /**
     * Middleware helper to validate PIN in requests
     */
    async validateRequestPin(userId: string, pin: string): Promise<void> {
        if (!pin) throw new Error('Transaction PIN is required');

        const isValid = await this.verifyPin(userId, pin);
        if (!isValid) {
            throw new Error('Invalid Transaction PIN');
        }
    }
}
