"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.purchaseBill = exports.verifyCustomer = exports.purchaseData = exports.purchaseAirtime = void 0;
const client_1 = require("@prisma/client");
const uuid_1 = require("uuid");
const security_service_1 = require("../services/security.service");
const prisma = new client_1.PrismaClient();
const securityService = new security_service_1.SecurityService();
// Purchase Airtime
const purchaseAirtime = async (req, res) => {
    var _a, _b;
    try {
        // @ts-ignore
        const userId = req.user.id;
        const { providerCode, amount, phone, network, pin, idempotencyKey } = req.body;
        // 0. Validate PIN
        try {
            await securityService.validateRequestPin(userId, pin);
        }
        catch (pinError) {
            return res.status(401).json({ error: pinError.message });
        }
        // 0.1 Check for Idempotency
        if (idempotencyKey) {
            const existingTx = await prisma.transaction.findFirst({
                where: { userId, idempotencyKey }
            });
            if (existingTx) {
                console.log(`[Idempotency] Duplicate request blocked for ${idempotencyKey}`);
                return res.json({
                    status: 'success',
                    message: 'Airtime purchase already processed',
                    reference: existingTx.reference,
                    amount: existingTx.amount,
                    phone: (_a = existingTx.metadata) === null || _a === void 0 ? void 0 : _a.phone,
                    network: (_b = existingTx.metadata) === null || _b === void 0 ? void 0 : _b.network
                });
            }
        }
        const reference = (0, uuid_1.v4)();
        // 1. Transactional Block with Pessimistic Locking
        const result = await prisma.$transaction(async (tx) => {
            // A. Fetch & Lock Wallet
            const walletResults = await tx.$queryRaw(client_1.Prisma.sql `SELECT * FROM "Wallet" WHERE "userId" = ${userId} AND "currency" = 'NGN' FOR UPDATE`);
            const wallet = walletResults[0];
            if (!wallet)
                throw new Error("Wallet not found");
            const balance = typeof wallet.balance === 'number' ? wallet.balance : Number(wallet.balance);
            if (balance < Number(amount))
                throw new Error("Insufficient balance");
            // B. Create Pending Transaction
            const transaction = await tx.transaction.create({
                data: {
                    userId,
                    walletId: wallet.id,
                    amount: Number(amount),
                    total: Number(amount),
                    type: client_1.TransactionType.AIRTIME,
                    status: client_1.TransactionStatus.PENDING,
                    reference,
                    idempotencyKey,
                    metadata: { network, phone, providerCode }
                }
            });
            // C. Debit Wallet
            const updatedWallet = await tx.wallet.update({
                where: { id: wallet.id },
                data: { balance: { decrement: Number(amount) } }
            });
            if (updatedWallet.balance.toNumber() < 0) {
                throw new Error("Insufficient balance (Race Condition)");
            }
            return { transaction, reference };
        });
        // 2. Call Provider API (Simulated)
        const success = true;
        if (success) {
            await prisma.transaction.update({
                where: { id: result.transaction.id },
                data: { status: client_1.TransactionStatus.SUCCESS, externalRef: `PROV-${(0, uuid_1.v4)()}` }
            });
            return res.json({
                status: 'success',
                message: 'Airtime purchase successful',
                reference: result.reference,
                amount,
                phone,
                network
            });
        }
        else {
            // Reversal logic would be here if provider failed sync
            return res.status(502).json({ error: "Provider failed" });
        }
    }
    catch (error) {
        console.error('Airtime Error:', error);
        res.status(400).json({ error: error.message || 'Internal Server Error' });
    }
};
exports.purchaseAirtime = purchaseAirtime;
// Purchase Data Bundle
const purchaseData = async (req, res) => {
    var _a, _b;
    try {
        // @ts-ignore
        const userId = req.user.id;
        const { providerCode, planCode, amount, phone, network, pin, idempotencyKey } = req.body;
        // 0. Validate PIN
        try {
            await securityService.validateRequestPin(userId, pin);
        }
        catch (pinError) {
            return res.status(401).json({ error: pinError.message });
        }
        // 0.1 Check for Idempotency
        if (idempotencyKey) {
            const existingTx = await prisma.transaction.findFirst({
                where: { userId, idempotencyKey }
            });
            if (existingTx) {
                return res.json({
                    status: 'success',
                    message: 'Data bundle already processed',
                    reference: existingTx.reference,
                    amount: existingTx.amount,
                    phone: (_a = existingTx.metadata) === null || _a === void 0 ? void 0 : _a.phone,
                    network: (_b = existingTx.metadata) === null || _b === void 0 ? void 0 : _b.network
                });
            }
        }
        const reference = (0, uuid_1.v4)();
        const result = await prisma.$transaction(async (tx) => {
            // A. Fetch & Lock Wallet
            const walletResults = await tx.$queryRaw(client_1.Prisma.sql `SELECT * FROM "Wallet" WHERE "userId" = ${userId} AND "currency" = 'NGN' FOR UPDATE`);
            const wallet = walletResults[0];
            if (!wallet)
                throw new Error("Wallet not found");
            const balance = typeof wallet.balance === 'number' ? wallet.balance : Number(wallet.balance);
            if (balance < Number(amount))
                throw new Error("Insufficient balance");
            // B. Create Pending Transaction
            const transaction = await tx.transaction.create({
                data: {
                    userId,
                    walletId: wallet.id,
                    amount: Number(amount),
                    total: Number(amount),
                    type: client_1.TransactionType.DATA,
                    status: client_1.TransactionStatus.PENDING,
                    reference,
                    idempotencyKey,
                    metadata: { network, phone, planCode, providerCode }
                }
            });
            // C. Debit Wallet
            await tx.wallet.update({
                where: { id: wallet.id },
                data: { balance: { decrement: Number(amount) } }
            });
            return { transaction, reference };
        });
        const success = true;
        if (success) {
            await prisma.transaction.update({
                where: { id: result.transaction.id },
                data: { status: client_1.TransactionStatus.SUCCESS, externalRef: `PROV-DATA-${(0, uuid_1.v4)()}` }
            });
            return res.json({
                status: 'success',
                message: 'Data bundle purchase successful',
                reference: result.reference,
                amount,
                phone,
                network
            });
        }
        else {
            return res.status(502).json({ error: "Provider failed" });
        }
    }
    catch (error) {
        console.error('Data Bundle Error:', error);
        res.status(400).json({ error: error.message || 'Internal Server Error' });
    }
};
exports.purchaseData = purchaseData;
// Verify Customer
const verifyCustomer = async (req, res) => {
    try {
        const { serviceCode, customerId, providerCode } = req.body;
        let customerName = "Simulated User";
        if (serviceCode.includes("ELECT")) {
            customerName = "METER: JOHN DOE";
        }
        else if (serviceCode.includes("TV")) {
            customerName = "TV: JANE DOE";
        }
        res.json({
            status: 'success',
            data: { customerName, customerId, serviceCode }
        });
    }
    catch (error) {
        res.status(500).json({ error: "Verification Failed" });
    }
};
exports.verifyCustomer = verifyCustomer;
// Purchase Bill (Electricity / TV)
const purchaseBill = async (req, res) => {
    var _a;
    try {
        // @ts-ignore
        const userId = req.user.id;
        const { serviceCode, customerId, amount, phone, type, providerCode, pin, idempotencyKey } = req.body;
        // 0. Validate PIN
        try {
            await securityService.validateRequestPin(userId, pin);
        }
        catch (pinError) {
            return res.status(401).json({ error: pinError.message });
        }
        // 0.1 Check for Idempotency
        if (idempotencyKey) {
            const existingTx = await prisma.transaction.findFirst({
                where: { userId, idempotencyKey }
            });
            if (existingTx) {
                return res.json({
                    status: 'success',
                    message: 'Bill payment already processed',
                    reference: existingTx.reference,
                    amount: existingTx.amount,
                    token: (_a = existingTx.metadata) === null || _a === void 0 ? void 0 : _a.token
                });
            }
        }
        const reference = (0, uuid_1.v4)();
        const result = await prisma.$transaction(async (tx) => {
            // A. Fetch & Lock Wallet
            const walletResults = await tx.$queryRaw(client_1.Prisma.sql `SELECT * FROM "Wallet" WHERE "userId" = ${userId} AND "currency" = 'NGN' FOR UPDATE`);
            const wallet = walletResults[0];
            if (!wallet)
                throw new Error("Wallet not found");
            const balance = typeof wallet.balance === 'number' ? wallet.balance : Number(wallet.balance);
            if (balance < Number(amount))
                throw new Error("Insufficient balance");
            // B. Create Transaction
            const transaction = await tx.transaction.create({
                data: {
                    userId,
                    walletId: wallet.id,
                    amount: Number(amount),
                    total: Number(amount),
                    type: type === 'ELECTRICITY' ? client_1.TransactionType.ELECTRICITY : client_1.TransactionType.CABLE,
                    status: client_1.TransactionStatus.PENDING,
                    reference,
                    idempotencyKey,
                    metadata: { customerId, serviceCode, phone, providerCode }
                }
            });
            // C. Debit Wallet
            await tx.wallet.update({
                where: { id: wallet.id },
                data: { balance: { decrement: Number(amount) } }
            });
            return { transaction, reference };
        });
        const success = true;
        if (success) {
            await prisma.transaction.update({
                where: { id: result.transaction.id },
                data: { status: client_1.TransactionStatus.SUCCESS, externalRef: `PROV-BILL-${(0, uuid_1.v4)()}` }
            });
            return res.json({
                status: 'success',
                message: 'Bill payment successful',
                reference: result.reference,
                amount,
                token: type === 'ELECTRICITY' ? '1234-5678-9012-3456' : undefined
            });
        }
        else {
            return res.status(502).json({ error: "Provider failed" });
        }
    }
    catch (error) {
        console.error('Bill Payment Error:', error);
        res.status(400).json({ error: error.message || 'Internal Server Error' });
    }
};
exports.purchaseBill = purchaseBill;
