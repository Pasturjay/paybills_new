import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
    const user = await prisma.user.findUnique({ where: { email: 'dev@paybills.ng' } });
    if (!user) {
        console.error('User not found');
        return;
    }
    const wallet = await prisma.wallet.findFirst({ where: { userId: user.id } });
    if (!wallet) {
        console.error('Wallet not found');
        return;
    }
    await prisma.wallet.update({
        where: { id: wallet.id },
        data: { balance: { increment: 50000 } }
    });
    await prisma.transaction.create({
        data: {
            userId: user.id,
            walletId: wallet.id,
            amount: 50000,
            total: 50000,
            type: 'FUNDING',
            status: 'SUCCESS',
            reference: 'PSUEDO_FUND_' + Date.now(),
            description: 'Admin Test Funds'
        }
    });
    console.log('Successfully provisioned 50,000 NGN to ' + user.email);
}

run()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
