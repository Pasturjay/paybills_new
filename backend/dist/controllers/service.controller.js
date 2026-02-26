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
exports.purchaseBill = exports.verifyCustomer = exports.purchaseData = exports.purchaseAirtime = void 0;
const client_1 = require("@prisma/client");
const uuid_1 = require("uuid");
const prisma = new client_1.PrismaClient();
// Purchase Airtime
const purchaseAirtime = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // @ts-ignore
        const userId = req.user.userId;
        const { providerCode, amount, phone, network } = req.body;
        // 1. Validate Balance
        const wallet = yield prisma.wallet.findFirst({
            where: { userId, currency: 'NGN' }
        });
        if (!wallet || Number(wallet.balance) < Number(amount)) {
            return res.status(400).json({ error: "Insufficient balance" });
        }
        // 2. Create Pending Transaction
        const reference = (0, uuid_1.v4)();
        const transaction = yield prisma.transaction.create({
            data: {
                userId,
                walletId: wallet.id,
                amount: Number(amount),
                total: Number(amount), // Add fee logic here if needed
                type: client_1.TransactionType.AIRTIME,
                status: client_1.TransactionStatus.PENDING,
                reference,
                metadata: {
                    network,
                    phone,
                    providerCode
                }
            }
        });
        // 3. Debit Wallet (Pessimistic Locking ideally, but atomic update here)
        yield prisma.wallet.update({
            where: { id: wallet.id },
            data: { balance: { decrement: Number(amount) } }
        });
        // 4. Call Provider API (Simulated)
        // const providerResponse = await vtpass.purchaseAirtime(...)
        const success = true; // Simulate success
        if (success) {
            // 5. Update Transaction to Success
            yield prisma.transaction.update({
                where: { id: transaction.id },
                data: { status: client_1.TransactionStatus.SUCCESS, externalRef: `PROV-${(0, uuid_1.v4)()}` }
            });
            return res.json({
                status: 'success',
                message: 'Airtime purchase successful',
                reference,
                amount,
                phone,
                network
            });
        }
        else {
            // 5b. Fail & Refund
            // ... Reversal logic
            return res.status(502).json({ error: "Provider failed" });
        }
    }
    catch (error) {
        console.error('Airtime Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
exports.purchaseAirtime = purchaseAirtime;
// Purchase Data Bundle
const purchaseData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // @ts-ignore
        const userId = req.user.userId;
        const { providerCode, planCode, amount, phone, network } = req.body;
        // 1. Validate Balance
        const wallet = yield prisma.wallet.findFirst({
            where: { userId, currency: 'NGN' }
        });
        if (!wallet || Number(wallet.balance) < Number(amount)) {
            return res.status(400).json({ error: "Insufficient balance" });
        }
        // 2. Create Pending Transaction
        const reference = (0, uuid_1.v4)();
        const transaction = yield prisma.transaction.create({
            data: {
                userId,
                walletId: wallet.id,
                amount: Number(amount),
                total: Number(amount),
                type: client_1.TransactionType.DATA,
                status: client_1.TransactionStatus.PENDING,
                reference,
                metadata: {
                    network,
                    phone,
                    planCode,
                    providerCode
                }
            }
        });
        // 3. Debit Wallet
        yield prisma.wallet.update({
            where: { id: wallet.id },
            data: { balance: { decrement: Number(amount) } }
        });
        // 4. Call Provider API (Simulated)
        // const providerResponse = await vtpass.purchaseData(...)
        const success = true;
        if (success) {
            yield prisma.transaction.update({
                where: { id: transaction.id },
                data: { status: client_1.TransactionStatus.SUCCESS, externalRef: `PROV-DATA-${(0, uuid_1.v4)()}` }
            });
            return res.json({
                status: 'success',
                message: 'Data bundle purchase successful',
                reference,
                amount,
                phone,
                network
            });
        }
        else {
            // Reversal logic would go here
            return res.status(502).json({ error: "Provider failed" });
        }
    }
    catch (error) {
        console.error('Data Bundle Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
exports.purchaseData = purchaseData;
// Verify Customer (Meter or Smartcard)
const verifyCustomer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { serviceCode, customerId, providerCode } = req.body;
        // Simulated Verification Response
        // In prod, call provider API (e.g., VTpass/Baxi)
        let customerName = "Simulated User";
        if (serviceCode.includes("ELECT")) {
            customerName = "METER: JOHN DOE";
        }
        else if (serviceCode.includes("TV")) {
            customerName = "TV: JANE DOE";
        }
        res.json({
            status: 'success',
            data: {
                customerName,
                customerId,
                serviceCode
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: "Verification Failed" });
    }
});
exports.verifyCustomer = verifyCustomer;
// Purchase Bill (Electricity / TV)
const purchaseBill = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // @ts-ignore
        const userId = req.user.userId;
        const { serviceCode, customerId, amount, phone, type, providerCode } = req.body;
        // type: 'ELECTRICITY' | 'TV'
        // 1. Validate Balance
        const wallet = yield prisma.wallet.findFirst({
            where: { userId, currency: 'NGN' }
        });
        if (!wallet || Number(wallet.balance) < Number(amount)) {
            return res.status(400).json({ error: "Insufficient balance" });
        }
        // 2. Create Transaction
        const reference = (0, uuid_1.v4)();
        const transaction = yield prisma.transaction.create({
            data: {
                userId,
                walletId: wallet.id,
                amount: Number(amount),
                total: Number(amount),
                type: type === 'ELECTRICITY' ? client_1.TransactionType.ELECTRICITY : client_1.TransactionType.CABLE,
                status: client_1.TransactionStatus.PENDING,
                reference,
                metadata: {
                    customerId, // Meter or Smartcard
                    serviceCode,
                    phone,
                    providerCode
                }
            }
        });
        // 3. Debit Wallet
        yield prisma.wallet.update({
            where: { id: wallet.id },
            data: { balance: { decrement: Number(amount) } }
        });
        // 4. Call Provider API
        const success = true;
        if (success) {
            yield prisma.transaction.update({
                where: { id: transaction.id },
                data: { status: client_1.TransactionStatus.SUCCESS, externalRef: `PROV-BILL-${(0, uuid_1.v4)()}` }
            });
            return res.json({
                status: 'success',
                message: 'Bill payment successful',
                reference,
                amount,
                token: type === 'ELECTRICITY' ? '1234-5678-9012-3456' : undefined // Return token for prepaid
            });
        }
        else {
            return res.status(502).json({ error: "Provider failed" });
        }
    }
    catch (error) {
        console.error('Bill Payment Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
exports.purchaseBill = purchaseBill;
