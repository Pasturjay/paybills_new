import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export class VirtualCardService {

    async createCard(userId: string, name: string = 'Virtual Card', color: string = 'blue') {
        // Mock generating card details
        const pan = `4000${Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0')}`;
        const cvv = Math.floor(Math.random() * 900 + 100).toString();
        const expiry = `${Math.floor(Math.random() * 12 + 1).toString().padStart(2, '0')}/${(new Date().getFullYear() + 3).toString().slice(-2)}`;

        // Save to DB
        const card = await prisma.virtualCard.create({
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
    }

    async getCards(userId: string) {
        return await prisma.virtualCard.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
    }

    async getCardDetails(userId: string, cardId: string) {
        return await prisma.virtualCard.findFirst({
            where: { id: cardId, userId }
        });
    }

    async fundCard(userId: string, cardId: string, amount: number) {
        return await prisma.$transaction(async (tx) => {
            // 1. Get User's NGN Wallet
            const wallet = await tx.wallet.findFirst({
                where: { userId, currency: 'NGN' }
            });

            if (!wallet || wallet.balance.toNumber() < amount) {
                throw new Error("Insufficient funds in your main wallet");
            }

            // 2. Debit Main Wallet
            await tx.wallet.update({
                where: { id: wallet.id },
                data: { balance: { decrement: amount } }
            });

            // 3. Credit Virtual Card
            const card = await tx.virtualCard.update({
                where: { id: cardId, userId },
                data: {
                    balance: { increment: amount }
                }
            });

            // 4. Create Transaction Record
            await tx.transaction.create({
                data: {
                    userId,
                    walletId: wallet.id,
                    type: 'VIRTUAL_CARD_FUNDING',
                    amount: amount,
                    total: amount,
                    status: 'SUCCESS',
                    reference: 'VCF_' + uuidv4(),
                    metadata: { cardId, cardName: card.name }
                }
            });

            return card;
        });
    }

    async withdrawFromCard(userId: string, cardId: string, amount: number) {
        return await prisma.virtualCard.update({
            where: { id: cardId, userId },
            data: {
                balance: { decrement: amount }
            }
        });
    }
}

export const virtualCardService = new VirtualCardService();
