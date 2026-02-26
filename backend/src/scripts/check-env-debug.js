
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("JWT_SECRET present:", !!process.env.JWT_SECRET);
    console.log("JWT_SECRET length:", process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0);

    try {
        const user = await prisma.user.findFirst();
        console.log("Found user:", user ? user.email : "None");
        if (user) {
            console.log("Password hash (first 10):", user.password.substring(0, 10));
        }
    } catch (e) {
        console.error(e);
    }
}

main();
