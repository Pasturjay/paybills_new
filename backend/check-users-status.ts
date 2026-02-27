import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkUsers() {
    console.log('Checking user status...');
    try {
        const users = await prisma.user.findMany({
            select: { id: true, email: true, firebaseUid: true, isActive: true, createdAt: true }
        });
        console.log('Users:', JSON.stringify(users, null, 2));
    } catch (error: any) {
        console.error('❌ Database check failed:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkUsers();
