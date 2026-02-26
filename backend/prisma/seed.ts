import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
    const email = process.env.ADMIN_EMAIL || 'admin@paybills.ng';
    const password = await bcrypt.hash('admin123', 10);

    const admin = await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
            email,
            phone: '08099999999',
            password,
            firstName: 'Super',
            lastName: 'Admin',
            role: 'ADMIN',
            isVerified: true,
            isActive: true,
            wallets: {
                create: {
                    currency: 'NGN',
                    balance: 1000000.00
                }
            }
        },
    });

    console.log({ admin });
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
