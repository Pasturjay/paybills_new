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
exports.purchaseSoftware = exports.purchaseBetting = exports.purchaseElectricity = exports.purchaseCable = exports.validateCable = exports.purchaseData = exports.purchaseAirtime = exports.sellGiftCard = exports.purchaseGiftCard = exports.purchaseEducation = exports.getProducts = void 0;
const client_1 = require("@prisma/client");
const clubkonnect_provider_1 = require("../providers/clubkonnect.provider");
const security_service_1 = require("../services/security.service");
const prisma = new client_1.PrismaClient();
const clubKonnectProvider = new clubkonnect_provider_1.ClubKonnectProvider();
const securityService = new security_service_1.SecurityService();
const getProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Return list of available services
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
});
exports.getProducts = getProducts;
const purchaseEducation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const { type, quantity = 1, pin } = req.body;
        // 1. Verify PIN
        yield securityService.validateRequestPin(userId, pin);
        // 2. Calculate Cost (Hardcoded for checking, should be DB driven)
        const prices = { 'WAEC': 3800, 'NECO': 1200, 'JAMB': 7700, 'NABTEB': 1500, 'NBAIS': 2000 };
        const cost = (prices[type] || 0) * quantity;
        if (cost === 0)
            return res.status(400).json({ error: 'Invalid Product Type' });
        // 3. Process Transaction
        yield prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const wallet = yield tx.wallet.findFirst({ where: { userId, currency: 'NGN' } });
            if (!wallet || wallet.balance.toNumber() < cost) {
                throw new Error('Insufficient funds');
            }
            yield tx.wallet.update({
                where: { id: wallet.id },
                data: { balance: { decrement: cost } }
            });
            // Call Provider
            const ref = 'EDU_' + Date.now();
            const response = yield clubKonnectProvider.purchaseEducationPIN(type, quantity, ref);
            if (response.status === 'FAILED') {
                throw new Error(response.message || 'Provider failed');
            }
            // Create Transaction
            yield tx.transaction.create({
                data: {
                    userId,
                    walletId: wallet.id,
                    amount: cost,
                    total: cost,
                    type: 'BILL_PAYMENT',
                    status: response.status === 'SUCCESS' ? 'SUCCESS' : 'PENDING',
                    reference: ref,
                    metadata: JSON.stringify({
                        type,
                        quantity,
                        tokens: response.token,
                        providerRef: response.providerReference
                    }),
                    description: `Purchase ${quantity} ${type} PIN(s)`
                }
            });
            // Return tokens to user
            return response;
        }));
        res.json({ message: 'Purchase successful', type, quantity });
    }
    catch (error) {
        console.error('Education Purchase Error:', error);
        res.status(400).json({ error: error.message || 'Purchase failed' });
    }
});
exports.purchaseEducation = purchaseEducation;
const purchaseGiftCard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const { cardId, amount, quantity = 1, pin } = req.body;
        yield securityService.validateRequestPin(userId, pin);
        // Placeholder: Fetch price from DB or Provider
        // const card = await prisma.giftCard.findUnique({ where: { id: cardId } });
        // const cost = card.price * quantity;
        const cost = Number(amount) * quantity; // Dynamic amount for now
        yield prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const wallet = yield tx.wallet.findFirst({ where: { userId, currency: 'NGN' } });
            if (!wallet || wallet.balance.toNumber() < cost)
                throw new Error('Insufficient funds');
            yield tx.wallet.update({
                where: { id: wallet.id },
                data: { balance: { decrement: cost } }
            });
            yield tx.transaction.create({
                data: {
                    userId,
                    walletId: wallet.id,
                    amount: cost,
                    total: cost,
                    type: 'BILL_PAYMENT', // Or GIFT_CARD if enum added
                    status: 'PENDING', // Async fulfillment usually
                    reference: 'GC_' + Date.now(),
                    description: `Gift Card Purchase`
                }
            });
        }));
        res.json({ message: 'Gift card purchase successful. Code will be sent shortly.' });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
exports.purchaseGiftCard = purchaseGiftCard;
const sellGiftCard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const { cardType, amount, cardCode, pin } = req.body;
        // Selling doesn't necessarily need PIN if it's incoming money, but good for confirmation? 
        // Maybe optional. Let's enforce for now to prevent accidental trades.
        // Actually, if I'm giving away a card code, I want to be sure.
        // Create a Trade Request
        // We likely need a Ticket/Trade model. For now, we mock success/pending.
        res.json({ message: 'Trade initiated. Please wait for admin verification.' });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
exports.sellGiftCard = sellGiftCard;
// ... existing imports
// ... existing code
const purchaseAirtime = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const { networkId, phoneNumber, amount, pin } = req.body;
        yield securityService.validateRequestPin(userId, pin);
        const cost = Number(amount);
        // Can add markup logic here later
        yield prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const wallet = yield tx.wallet.findFirst({ where: { userId, currency: 'NGN' } });
            if (!wallet || wallet.balance.toNumber() < cost)
                throw new Error('Insufficient funds');
            yield tx.wallet.update({
                where: { id: wallet.id },
                data: { balance: { decrement: cost } }
            });
            const ref = 'AIR_' + Date.now();
            const response = yield clubKonnectProvider.purchaseAirtime(networkId, phoneNumber, cost, ref);
            if (response.status === 'FAILED')
                throw new Error(response.message || 'Provider failed');
            yield tx.transaction.create({
                data: {
                    userId,
                    walletId: wallet.id,
                    amount: cost,
                    total: cost,
                    type: 'AIRTIME',
                    status: response.status === 'SUCCESS' ? 'SUCCESS' : 'PENDING',
                    reference: ref,
                    metadata: JSON.stringify({ networkId, phoneNumber, providerRef: response.providerReference }),
                    description: `Airtime Purchase (${phoneNumber})`
                }
            });
            return response;
        }));
        res.json({ message: 'Airtime purchase successful' });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
exports.purchaseAirtime = purchaseAirtime;
const purchaseData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const { networkId, planId, phoneNumber, amount, pin } = req.body; // Amount needed if we don't look it up yet
        yield securityService.validateRequestPin(userId, pin);
        // For security, we SHOULD fetch price from provider or DB plan list ensuring no tampering
        // For now, accepting amount from frontend (UNSAFE - TODO: Fix in next iteration) or assume passed correctly
        const cost = Number(amount);
        yield prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const wallet = yield tx.wallet.findFirst({ where: { userId, currency: 'NGN' } });
            if (!wallet || wallet.balance.toNumber() < cost)
                throw new Error('Insufficient funds');
            yield tx.wallet.update({
                where: { id: wallet.id },
                data: { balance: { decrement: cost } }
            });
            const ref = 'DATA_' + Date.now();
            const response = yield clubKonnectProvider.purchaseData(networkId, planId, phoneNumber, ref);
            if (response.status === 'FAILED')
                throw new Error(response.message || 'Provider failed');
            yield tx.transaction.create({
                data: {
                    userId,
                    walletId: wallet.id,
                    amount: cost,
                    total: cost,
                    type: 'DATA',
                    status: response.status === 'SUCCESS' ? 'SUCCESS' : 'PENDING',
                    reference: ref,
                    metadata: JSON.stringify({ networkId, planId, phoneNumber, providerRef: response.providerReference }),
                    description: `Data Purchase (${phoneNumber})`
                }
            });
            return response;
        }));
        res.json({ message: 'Data purchase successful' });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
exports.purchaseData = purchaseData;
const validateCable = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { providerId, smartcardNumber } = req.body;
        const validation = yield clubKonnectProvider.validateCableSmartcard(providerId, smartcardNumber);
        res.json(validation);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
exports.validateCable = validateCable;
const purchaseCable = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const { providerId, packageId, smartcardNumber, amount, pin } = req.body;
        yield securityService.validateRequestPin(userId, pin);
        const cost = Number(amount);
        yield prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const wallet = yield tx.wallet.findFirst({ where: { userId, currency: 'NGN' } });
            if (!wallet || wallet.balance.toNumber() < cost)
                throw new Error('Insufficient funds');
            yield tx.wallet.update({
                where: { id: wallet.id },
                data: { balance: { decrement: cost } }
            });
            const ref = 'CABLE_' + Date.now();
            const response = yield clubKonnectProvider.purchaseCable(providerId, packageId, smartcardNumber, ref);
            if (response.status === 'FAILED')
                throw new Error(response.message || 'Provider failed');
            yield tx.transaction.create({
                data: {
                    userId,
                    walletId: wallet.id,
                    amount: cost,
                    total: cost,
                    type: 'CABLE',
                    status: response.status === 'SUCCESS' ? 'SUCCESS' : 'PENDING',
                    reference: ref,
                    metadata: JSON.stringify({ providerId, packageId, smartcardNumber, providerRef: response.providerReference }),
                    description: `Cable TV Purchase (${smartcardNumber})`
                }
            });
            return response;
        }));
        res.json({ message: 'Cable TV subscription successful' });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
exports.purchaseCable = purchaseCable;
const purchaseElectricity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const { providerId, meterNumber, amount, pin } = req.body;
        if (!providerId || !meterNumber || !amount || !pin) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        // 1. Verify PIN
        yield securityService.validateRequestPin(userId, pin);
        const cost = Number(amount);
        // 2. Process Transaction
        const result = yield prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const wallet = yield tx.wallet.findFirst({ where: { userId, currency: 'NGN' } });
            if (!wallet || wallet.balance.toNumber() < cost) {
                throw new Error('Insufficient funds');
            }
            // Debit Wallet
            yield tx.wallet.update({
                where: { id: wallet.id },
                data: { balance: { decrement: cost } }
            });
            // Call Provider
            const ref = 'ELEC_' + Date.now();
            const response = yield clubKonnectProvider.purchaseElectricity(providerId, meterNumber, cost, ref);
            if (response.status === 'FAILED') {
                throw new Error(response.message || 'Provider failed');
            }
            // Create Transaction
            yield tx.transaction.create({
                data: {
                    userId,
                    walletId: wallet.id,
                    amount: cost,
                    total: cost,
                    type: 'BILL_PAYMENT', // or ELECTRICITY if enum exists
                    status: response.status === 'SUCCESS' ? 'SUCCESS' : 'PENDING',
                    reference: ref,
                    metadata: JSON.stringify({
                        providerId,
                        meterNumber,
                        token: response.token,
                        providerRef: response.providerReference
                    }),
                    description: `Electricity Token ${cost} for ${meterNumber} (${providerId})`
                }
            });
            return response;
        }));
        res.json({ message: 'Electricity purchase successful', data: result });
    }
    catch (error) {
        console.error('Electricity Purchase Error:', error);
        res.status(400).json({ error: error.message || 'Transaction failed' });
    }
});
exports.purchaseElectricity = purchaseElectricity;
const purchaseBetting = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const { customerId, bookmaker, amount, pin } = req.body;
        if (!customerId || !bookmaker || !amount || !pin) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        // 1. Verify PIN
        yield securityService.validateRequestPin(userId, pin);
        // 2. Process Transaction
        const result = yield prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const wallet = yield tx.wallet.findFirst({ where: { userId, currency: 'NGN' } });
            if (!wallet || wallet.balance.toNumber() < Number(amount)) {
                throw new Error('Insufficient funds');
            }
            // Debit Wallet
            yield tx.wallet.update({
                where: { id: wallet.id },
                data: { balance: { decrement: Number(amount) } }
            });
            // Call Provider
            const ref = 'BET_' + Date.now();
            const response = yield clubKonnectProvider.fundBettingWallet(customerId, Number(amount), bookmaker, ref);
            if (response.status === 'FAILED') {
                throw new Error(response.message || 'Provider failed');
            }
            // Create Transaction
            yield tx.transaction.create({
                data: {
                    userId,
                    walletId: wallet.id,
                    amount: Number(amount),
                    total: Number(amount),
                    type: 'BILL_PAYMENT',
                    status: response.status === 'SUCCESS' ? 'SUCCESS' : 'PENDING',
                    reference: ref,
                    metadata: JSON.stringify({
                        customerId,
                        bookmaker,
                        providerRef: response.providerReference
                    }),
                    description: `Betting Topup ${amount} for ${customerId} (${bookmaker})`
                }
            });
            return response;
        }));
        res.json({ message: 'Betting wallet funded successfully', data: result });
    }
    catch (error) {
        console.error('Betting Purchase Error:', error);
        res.status(400).json({ error: error.message || 'Transaction failed' });
    }
});
exports.purchaseBetting = purchaseBetting;
const purchaseSoftware = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const { itemCode, amount, pin } = req.body;
        if (!itemCode || !amount || !pin) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        // 1. Verify PIN
        yield securityService.validateRequestPin(userId, pin);
        // 2. Process Transaction
        const result = yield prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const wallet = yield tx.wallet.findFirst({ where: { userId, currency: 'NGN' } });
            if (!wallet || wallet.balance.toNumber() < Number(amount)) {
                throw new Error('Insufficient funds');
            }
            // Debit Wallet
            yield tx.wallet.update({
                where: { id: wallet.id },
                data: { balance: { decrement: Number(amount) } }
            });
            // Mock Provider Call (Software not yet integrated in provider)
            const ref = 'SOFT_' + Date.now();
            const mockLicenseKey = 'XXXX-YYYY-ZZZZ-' + Math.floor(Math.random() * 10000);
            // Create Transaction
            yield tx.transaction.create({
                data: {
                    userId,
                    walletId: wallet.id,
                    amount: Number(amount),
                    total: Number(amount),
                    type: 'BILL_PAYMENT',
                    status: 'SUCCESS',
                    reference: ref,
                    metadata: JSON.stringify({
                        itemCode,
                        licenseKey: mockLicenseKey
                    }),
                    description: `Software Purchase ${itemCode}`
                }
            });
            return { status: 'SUCCESS', licenseKey: mockLicenseKey, reference: ref };
        }));
        res.json({ message: 'Software license purchased successfully', data: result });
    }
    catch (error) {
        console.error('Software Purchase Error:', error);
        res.status(400).json({ error: error.message || 'Transaction failed' });
    }
});
exports.purchaseSoftware = purchaseSoftware;
