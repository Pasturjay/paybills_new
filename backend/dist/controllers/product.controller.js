"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.purchaseBetting = exports.purchaseElectricity = exports.purchaseCable = exports.validateCable = exports.purchaseData = exports.purchaseAirtime = exports.sellGiftCard = exports.purchaseGiftCard = exports.purchaseEducation = exports.getProducts = void 0;
const client_1 = require("@prisma/client");
const clubkonnect_provider_1 = require("../providers/clubkonnect.provider");
const security_service_1 = require("../services/security.service");
const socket_service_1 = require("../services/socket.service");
const prisma = new client_1.PrismaClient();
const clubKonnectProvider = new clubkonnect_provider_1.ClubKonnectProvider();
const securityService = new security_service_1.SecurityService();
const getProducts = async (req, res) => {
    res.json({
        education: [
            { id: 'WAEC', name: 'WAEC Result Checker', price: 3800 },
            { id: 'NECO', name: 'NECO Result Token', price: 1200 },
            { id: 'JAMB', name: 'JAMB UTME PIN', price: 7700 },
            { id: 'NABTEB', name: 'NABTEB Result Checker', price: 1500 },
            { id: 'NBAIS', name: 'NBAIS Result Checker', price: 2000 }
        ],
        virtualNumbers: [
            { country: 'US', price: 5000 },
            { country: 'UK', price: 6000 }
        ]
    });
};
exports.getProducts = getProducts;
const purchaseEducation = async (req, res) => {
    var _a;
    try {
        const userId = req.user.id;
        const { type, quantity = 1, pin, idempotencyKey } = req.body;
        await securityService.validateRequestPin(userId, pin);
        // Idempotency Check
        if (idempotencyKey) {
            const existing = await prisma.transaction.findFirst({ where: { userId, idempotencyKey } });
            if (existing) {
                return res.json({ message: 'Purchase already processed', type, quantity, status: existing.status });
            }
        }
        const prices = { 'WAEC': 3800, 'NECO': 1200, 'JAMB': 7700, 'NABTEB': 1500, 'NBAIS': 2000 };
        const cost = (prices[type] || 0) * quantity;
        if (cost === 0)
            return res.status(400).json({ error: 'Invalid Product Type' });
        await prisma.$transaction(async (tx) => {
            const walletResults = await tx.$queryRaw(client_1.Prisma.sql `SELECT * FROM "Wallet" WHERE "userId" = ${userId} AND "currency" = 'NGN' FOR UPDATE`);
            const wallet = walletResults[0];
            if (!wallet || Number(wallet.balance) < cost) {
                throw new Error('Insufficient funds');
            }
            await tx.wallet.update({
                where: { id: wallet.id },
                data: { balance: { decrement: cost } }
            });
            const ref = 'EDU_' + Date.now();
            const response = await clubKonnectProvider.purchaseEducationPIN(type, quantity, ref);
            if (response.status === 'FAILED') {
                throw new Error(response.message || 'Provider failed');
            }
            await tx.transaction.create({
                data: {
                    userId,
                    walletId: wallet.id,
                    amount: cost,
                    total: cost,
                    type: 'BILL_PAYMENT',
                    status: response.status === 'SUCCESS' ? 'SUCCESS' : 'PENDING',
                    reference: ref,
                    idempotencyKey,
                    metadata: {
                        type,
                        quantity,
                        tokens: response.token,
                        providerRef: response.providerReference
                    },
                    description: `Purchase ${quantity} ${type} PIN(s)`
                }
            });
            return response;
        });
        const newBalance = (_a = (await prisma.wallet.findFirst({ where: { userId, currency: 'NGN' } }))) === null || _a === void 0 ? void 0 : _a.balance;
        socket_service_1.socketService.emitToUser(userId, 'BALANCE_UPDATE', { balance: newBalance });
        socket_service_1.socketService.emitToUser(userId, 'TRANSACTION_NEW', {
            id: 'EDU_' + Date.now(),
            type: 'BILL_PAYMENT',
            amount: cost,
            status: 'SUCCESS',
            message: `Purchase of ${quantity} ${type} PIN(s) successful`
        });
        res.json({ message: 'Purchase successful', type, quantity });
    }
    catch (error) {
        console.error('Education Purchase Error:', error);
        res.status(400).json({ error: error.message || 'Purchase failed' });
    }
};
exports.purchaseEducation = purchaseEducation;
const purchaseGiftCard = async (req, res) => {
    try {
        const userId = req.user.id;
        const { cardId, amount, quantity = 1, pin, idempotencyKey } = req.body;
        await securityService.validateRequestPin(userId, pin);
        if (idempotencyKey) {
            const existing = await prisma.transaction.findFirst({ where: { userId, idempotencyKey } });
            if (existing)
                return res.json({ message: 'Purchase already processed' });
        }
        const cost = Number(amount) * quantity;
        await prisma.$transaction(async (tx) => {
            const walletResults = await tx.$queryRaw(client_1.Prisma.sql `SELECT * FROM "Wallet" WHERE "userId" = ${userId} AND "currency" = 'NGN' FOR UPDATE`);
            const wallet = walletResults[0];
            if (!wallet || Number(wallet.balance) < cost)
                throw new Error('Insufficient funds');
            await tx.wallet.update({
                where: { id: wallet.id },
                data: { balance: { decrement: cost } }
            });
            await tx.transaction.create({
                data: {
                    userId,
                    walletId: wallet.id,
                    amount: cost,
                    total: cost,
                    type: 'BILL_PAYMENT',
                    status: 'PENDING',
                    reference: 'GC_' + Date.now(),
                    idempotencyKey,
                    description: `Gift Card Purchase`
                }
            });
        });
        res.json({ message: 'Gift card purchase successful. Code will be sent shortly.' });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.purchaseGiftCard = purchaseGiftCard;
const sellGiftCard = async (req, res) => {
    try {
        res.json({ message: 'Trade initiated. Please wait for admin verification.' });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.sellGiftCard = sellGiftCard;
const purchaseAirtime = async (req, res) => {
    var _a;
    try {
        const userId = req.user.id;
        const { networkId, phoneNumber, amount, pin, idempotencyKey } = req.body;
        await securityService.validateRequestPin(userId, pin);
        if (idempotencyKey) {
            const existing = await prisma.transaction.findFirst({ where: { userId, idempotencyKey } });
            if (existing)
                return res.json({ message: 'Airtime purchase already processed', status: existing.status });
        }
        const cost = Number(amount);
        await prisma.$transaction(async (tx) => {
            const walletResults = await tx.$queryRaw(client_1.Prisma.sql `SELECT * FROM "Wallet" WHERE "userId" = ${userId} AND "currency" = 'NGN' FOR UPDATE`);
            const wallet = walletResults[0];
            if (!wallet || Number(wallet.balance) < cost)
                throw new Error('Insufficient funds');
            await tx.wallet.update({
                where: { id: wallet.id },
                data: { balance: { decrement: cost } }
            });
            const ref = 'AIR_' + Date.now();
            const response = await clubKonnectProvider.purchaseAirtime(networkId, phoneNumber, cost, ref);
            if (response.status === 'FAILED')
                throw new Error(response.message || 'Provider failed');
            await tx.transaction.create({
                data: {
                    userId,
                    walletId: wallet.id,
                    amount: cost,
                    total: cost,
                    type: 'AIRTIME',
                    status: response.status === 'SUCCESS' ? 'SUCCESS' : 'PENDING',
                    reference: ref,
                    idempotencyKey,
                    metadata: { networkId, phoneNumber, providerRef: response.providerReference },
                    description: `Airtime Purchase (${phoneNumber})`
                }
            });
            return response;
        });
        const newBalance = (_a = (await prisma.wallet.findFirst({ where: { userId, currency: 'NGN' } }))) === null || _a === void 0 ? void 0 : _a.balance;
        socket_service_1.socketService.emitToUser(userId, 'BALANCE_UPDATE', { balance: newBalance });
        socket_service_1.socketService.emitToUser(userId, 'TRANSACTION_NEW', {
            id: 'AIR_' + Date.now(),
            type: 'AIRTIME',
            amount: cost,
            status: 'SUCCESS',
            message: `Airtime purchase of ₦${cost} successful`
        });
        res.json({ message: 'Airtime purchase successful' });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.purchaseAirtime = purchaseAirtime;
const purchaseData = async (req, res) => {
    var _a;
    try {
        const userId = req.user.id;
        const { networkId, planId, phoneNumber, amount, pin, idempotencyKey } = req.body;
        await securityService.validateRequestPin(userId, pin);
        if (idempotencyKey) {
            const existing = await prisma.transaction.findFirst({ where: { userId, idempotencyKey } });
            if (existing)
                return res.json({ message: 'Data purchase already processed', status: existing.status });
        }
        const cost = Number(amount);
        await prisma.$transaction(async (tx) => {
            const walletResults = await tx.$queryRaw(client_1.Prisma.sql `SELECT * FROM "Wallet" WHERE "userId" = ${userId} AND "currency" = 'NGN' FOR UPDATE`);
            const wallet = walletResults[0];
            if (!wallet || Number(wallet.balance) < cost)
                throw new Error('Insufficient funds');
            await tx.wallet.update({
                where: { id: wallet.id },
                data: { balance: { decrement: cost } }
            });
            const ref = 'DATA_' + Date.now();
            const response = await clubKonnectProvider.purchaseData(networkId, planId, phoneNumber, ref);
            if (response.status === 'FAILED')
                throw new Error(response.message || 'Provider failed');
            await tx.transaction.create({
                data: {
                    userId,
                    walletId: wallet.id,
                    amount: cost,
                    total: cost,
                    type: 'DATA',
                    status: response.status === 'SUCCESS' ? 'SUCCESS' : 'PENDING',
                    reference: ref,
                    idempotencyKey,
                    metadata: { networkId, planId, phoneNumber, providerRef: response.providerReference },
                    description: `Data Purchase (${phoneNumber})`
                }
            });
            return response;
        });
        const newBalance = (_a = (await prisma.wallet.findFirst({ where: { userId, currency: 'NGN' } }))) === null || _a === void 0 ? void 0 : _a.balance;
        socket_service_1.socketService.emitToUser(userId, 'BALANCE_UPDATE', { balance: newBalance });
        socket_service_1.socketService.emitToUser(userId, 'TRANSACTION_NEW', {
            id: 'DATA_' + Date.now(),
            type: 'DATA',
            amount: cost,
            status: 'SUCCESS',
            message: `Data purchase of ₦${cost} successful`
        });
        res.json({ message: 'Data purchase successful' });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.purchaseData = purchaseData;
const validateCable = async (req, res) => {
    try {
        const { providerId, smartcardNumber } = req.body;
        const validation = await clubKonnectProvider.validateCableSmartcard(providerId, smartcardNumber);
        res.json(validation);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.validateCable = validateCable;
const purchaseCable = async (req, res) => {
    try {
        const userId = req.user.id;
        const { providerId, packageId, smartcardNumber, amount, pin, idempotencyKey } = req.body;
        await securityService.validateRequestPin(userId, pin);
        if (idempotencyKey) {
            const existing = await prisma.transaction.findFirst({ where: { userId, idempotencyKey } });
            if (existing)
                return res.json({ message: 'Cable subscription already processed', status: existing.status });
        }
        const cost = Number(amount);
        await prisma.$transaction(async (tx) => {
            const walletResults = await tx.$queryRaw(client_1.Prisma.sql `SELECT * FROM "Wallet" WHERE "userId" = ${userId} AND "currency" = 'NGN' FOR UPDATE`);
            const wallet = walletResults[0];
            if (!wallet || Number(wallet.balance) < cost)
                throw new Error('Insufficient funds');
            await tx.wallet.update({
                where: { id: wallet.id },
                data: { balance: { decrement: cost } }
            });
            const ref = 'CABLE_' + Date.now();
            const response = await clubKonnectProvider.purchaseCable(providerId, packageId, smartcardNumber, ref);
            if (response.status === 'FAILED')
                throw new Error(response.message || 'Provider failed');
            await tx.transaction.create({
                data: {
                    userId,
                    walletId: wallet.id,
                    amount: cost,
                    total: cost,
                    type: 'CABLE',
                    status: response.status === 'SUCCESS' ? 'SUCCESS' : 'PENDING',
                    reference: ref,
                    idempotencyKey,
                    metadata: { providerId, packageId, smartcardNumber, providerRef: response.providerReference },
                    description: `Cable TV Purchase (${smartcardNumber})`
                }
            });
            return response;
        });
        res.json({ message: 'Cable TV subscription successful' });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.purchaseCable = purchaseCable;
const purchaseElectricity = async (req, res) => {
    try {
        const userId = req.user.id;
        const { providerId, meterNumber, amount, pin, idempotencyKey } = req.body;
        if (!providerId || !meterNumber || !amount || !pin) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        await securityService.validateRequestPin(userId, pin);
        if (idempotencyKey) {
            const existing = await prisma.transaction.findFirst({ where: { userId, idempotencyKey } });
            if (existing)
                return res.json({ message: 'Electricity purchase already processed', status: existing.status });
        }
        const cost = Number(amount);
        const result = await prisma.$transaction(async (tx) => {
            const walletResults = await tx.$queryRaw(client_1.Prisma.sql `SELECT * FROM "Wallet" WHERE "userId" = ${userId} AND "currency" = 'NGN' FOR UPDATE`);
            const wallet = walletResults[0];
            if (!wallet || Number(wallet.balance) < cost) {
                throw new Error('Insufficient funds');
            }
            await tx.wallet.update({
                where: { id: wallet.id },
                data: { balance: { decrement: cost } }
            });
            const ref = 'ELEC_' + Date.now();
            const response = await clubKonnectProvider.purchaseElectricity(providerId, meterNumber, cost, ref);
            if (response.status === 'FAILED') {
                throw new Error(response.message || 'Provider failed');
            }
            await tx.transaction.create({
                data: {
                    userId,
                    walletId: wallet.id,
                    amount: cost,
                    total: cost,
                    type: 'BILL_PAYMENT',
                    status: response.status === 'SUCCESS' ? 'SUCCESS' : 'PENDING',
                    reference: ref,
                    idempotencyKey,
                    metadata: {
                        providerId,
                        meterNumber,
                        token: response.token,
                        providerRef: response.providerReference
                    },
                    description: `Electricity Token ${cost} for ${meterNumber} (${providerId})`
                }
            });
            return response;
        });
        res.json({ message: 'Electricity purchase successful', data: result });
    }
    catch (error) {
        console.error('Electricity Purchase Error:', error);
        res.status(400).json({ error: error.message || 'Transaction failed' });
    }
};
exports.purchaseElectricity = purchaseElectricity;
const purchaseBetting = async (req, res) => {
    try {
        const userId = req.user.id;
        const { customerId, bookmaker, amount, pin, idempotencyKey } = req.body;
        if (!customerId || !bookmaker || !amount || !pin) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        await securityService.validateRequestPin(userId, pin);
        if (idempotencyKey) {
            const existing = await prisma.transaction.findFirst({ where: { userId, idempotencyKey } });
            if (existing)
                return res.json({ message: 'Betting topup already processed', status: existing.status });
        }
        const result = await prisma.$transaction(async (tx) => {
            const walletResults = await tx.$queryRaw(client_1.Prisma.sql `SELECT * FROM "Wallet" WHERE "userId" = ${userId} AND "currency" = 'NGN' FOR UPDATE`);
            const wallet = walletResults[0];
            if (!wallet || Number(wallet.balance) < Number(amount)) {
                throw new Error('Insufficient funds');
            }
            await tx.wallet.update({
                where: { id: wallet.id },
                data: { balance: { decrement: Number(amount) } }
            });
            const ref = 'BET_' + Date.now();
            const response = await clubKonnectProvider.fundBettingWallet(customerId, Number(amount), bookmaker, ref);
            if (response.status === 'FAILED') {
                throw new Error(response.message || 'Provider failed');
            }
            await tx.transaction.create({
                data: {
                    userId,
                    walletId: wallet.id,
                    amount: Number(amount),
                    total: Number(amount),
                    type: 'BILL_PAYMENT',
                    status: response.status === 'SUCCESS' ? 'SUCCESS' : 'PENDING',
                    reference: ref,
                    idempotencyKey,
                    metadata: {
                        customerId,
                        bookmaker,
                        providerRef: response.providerReference
                    },
                    description: `Betting Topup ${amount} for ${customerId} (${bookmaker})`
                }
            });
            return response;
        });
        res.json({ message: 'Betting wallet funded successfully', data: result });
    }
    catch (error) {
        console.error('Betting Purchase Error:', error);
        res.status(400).json({ error: error.message || 'Transaction failed' });
    }
};
exports.purchaseBetting = purchaseBetting;
