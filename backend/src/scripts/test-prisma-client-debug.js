
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        // Try to query using userTag - if it's not in the client schema, this might work in JS if the DB has it??
        // Actually, Prisma Client validates args at runtime too.
        console.log("Testing userTag query...");
        const user = await prisma.user.findFirst({
            where: { userTag: "test" }
        });
        console.log("Query success (result doesn't matter)");
    } catch (e) {
        console.error("Prisma Client Error:", e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
