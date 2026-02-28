import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

const ensureAdmin = async () => {
    const email = process.argv[2];

    if (!email) {
        console.error('Please provide an email address. Usage: npx ts-node src/scripts/ensureAdmin.ts <email>');
        process.exit(1);
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (user) {
            const updatedUser = await prisma.user.update({
                where: { id: user.id },
                data: { role: Role.ADMIN },
            });
            console.log(`Successfully promoted existing user ${updatedUser.email} to ADMIN.`);
        } else {
            // Create new shell user
            const newUser = await prisma.user.create({
                data: {
                    email,
                    role: Role.ADMIN,
                    isActive: true,
                    isVerified: true,
                    authProvider: 'EMAIL',
                    firstName: 'System',
                    lastName: 'Admin'
                },
            });
            // Create wallet for them
            await prisma.wallet.create({
                data: { userId: newUser.id, currency: 'NGN', balance: 0.00 },
            });
            console.log(`Created new ADMIN shell for ${newUser.email}. They can now sign up in Firebase and will be auto-linked.`);
        }
    } catch (error) {
        console.error('Error ensuring admin:', error);
    } finally {
        await prisma.$disconnect();
    }
};

ensureAdmin();
