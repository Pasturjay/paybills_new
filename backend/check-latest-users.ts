import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkLatestUsers() {
    console.log('Checking latest user status...');
    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            take: 10,
            select: { id: true, email: true, firebaseUid: true, authProvider: true, createdAt: true, lastLoginAt: true }
        });
        console.log('Latest 10 Users:');
        users.forEach(u => {
            console.log(`- ID: ${u.id}, Email: ${u.email}, UID: ${u.firebaseUid}, Provider: ${u.authProvider}, Created: ${u.createdAt}, LastLogin: ${u.lastLoginAt}`);
        });
    } catch (error: any) {
        console.error('❌ Database check failed:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkLatestUsers();
