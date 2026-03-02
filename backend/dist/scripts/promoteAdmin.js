"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const promoteUser = async () => {
    const email = process.argv[2];
    if (!email) {
        console.error('Please provide an email address. Usage: npm run promote-admin <email>');
        process.exit(1);
    }
    try {
        const user = await prisma.user.update({
            where: { email },
            data: { role: client_1.Role.ADMIN },
        });
        console.log(`Successfully promoted ${user.email} to ADMIN.`);
    }
    catch (error) {
        console.error('Error promoting user:', error);
    }
    finally {
        await prisma.$disconnect();
    }
};
promoteUser();
