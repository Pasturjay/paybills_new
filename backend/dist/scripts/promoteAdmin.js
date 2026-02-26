"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const promoteUser = () => __awaiter(void 0, void 0, void 0, function* () {
    const email = process.argv[2];
    if (!email) {
        console.error('Please provide an email address. Usage: npm run promote-admin <email>');
        process.exit(1);
    }
    try {
        const user = yield prisma.user.update({
            where: { email },
            data: { role: client_1.Role.ADMIN },
        });
        console.log(`Successfully promoted ${user.email} to ADMIN.`);
    }
    catch (error) {
        console.error('Error promoting user:', error);
    }
    finally {
        yield prisma.$disconnect();
    }
});
promoteUser();
