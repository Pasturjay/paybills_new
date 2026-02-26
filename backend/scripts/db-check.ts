import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Connecting to DB...');
        await prisma.$connect();
        console.log('Connected.');

        console.log('Checking User count...');
        const count = await prisma.user.count();
        console.log(`User count: ${count}`);

        console.log('Attempting simple create...');
        const email = `test_db_${Date.now()}@example.com`;
        const user = await prisma.user.create({
            data: {
                email,
                password: 'hashedpassword',
                firstName: 'DB',
                lastName: 'Check',
                phone: `080${Date.now()}`.substring(0, 11),
                // Minimal fields
            }
        });
        console.log('User created:', user.id);

        // Cleanup
        await prisma.user.delete({ where: { id: user.id } });
        console.log('User deleted.');

    } catch (e: any) {
        console.error('DB Check Failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
