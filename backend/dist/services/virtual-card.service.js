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
exports.virtualCardService = exports.VirtualCardService = void 0;
const client_1 = require("@prisma/client");
const uuid_1 = require("uuid");
const prisma = new client_1.PrismaClient();
class VirtualCardService {
    createCard(userId_1) {
        return __awaiter(this, arguments, void 0, function* (userId, name = 'Virtual Card', color = 'blue') {
            // Mock generating card details
            const pan = `4000${Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0')}`;
            const cvv = Math.floor(Math.random() * 900 + 100).toString();
            const expiry = `${Math.floor(Math.random() * 12 + 1).toString().padStart(2, '0')}/${(new Date().getFullYear() + 3).toString().slice(-2)}`;
            // Save to DB
            const card = yield prisma.virtualCard.create({
                data: {
                    userId,
                    name,
                    pan: `**** **** **** ${pan.slice(-4)}`,
                    fullPan: pan, // In production, encrypt this!
                    cvv,
                    expiry,
                    color,
                    balance: 0.00,
                    status: 'ACTIVE'
                }
            });
            return card;
        });
    }
    getCards(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma.virtualCard.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' }
            });
        });
    }
    getCardDetails(userId, cardId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma.virtualCard.findFirst({
                where: { id: cardId, userId }
            });
        });
    }
    fundCard(userId, cardId, amount) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                // 1. Get User's NGN Wallet
                const wallet = yield tx.wallet.findFirst({
                    where: { userId, currency: 'NGN' }
                });
                if (!wallet || wallet.balance.toNumber() < amount) {
                    throw new Error("Insufficient funds in your main wallet");
                }
                // 2. Debit Main Wallet
                yield tx.wallet.update({
                    where: { id: wallet.id },
                    data: { balance: { decrement: amount } }
                });
                // 3. Credit Virtual Card
                const card = yield tx.virtualCard.update({
                    where: { id: cardId, userId },
                    data: {
                        balance: { increment: amount }
                    }
                });
                // 4. Create Transaction Record
                yield tx.transaction.create({
                    data: {
                        userId,
                        walletId: wallet.id,
                        type: 'VIRTUAL_CARD_FUNDING',
                        amount: amount,
                        total: amount,
                        status: 'SUCCESS',
                        reference: 'VCF_' + (0, uuid_1.v4)(),
                        metadata: { cardId, cardName: card.name }
                    }
                });
                return card;
            }));
        });
    }
    withdrawFromCard(userId, cardId, amount) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma.virtualCard.update({
                where: { id: cardId, userId },
                data: {
                    balance: { decrement: amount }
                }
            });
        });
    }
}
exports.VirtualCardService = VirtualCardService;
exports.virtualCardService = new VirtualCardService();
