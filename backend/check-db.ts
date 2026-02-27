import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkUsers() {
    console.log('Checking recently created users...');
    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            take: 5
        });
        console.log('Last 5 users:', JSON.stringify(users, (key, value) => {
            if (key === 'password' || key === 'transactionPin') return '***';
            return value;
        }, 2));

        const count = await prisma.user.count();
        console.log('Total user count:', count);
    } catch (error: any) {
        console.error('❌ Database check failed:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkUsers();
