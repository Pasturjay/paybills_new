import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class NotificationService {

    async getUserNotifications(userId: string) {
        return await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 20
        });
    }

    async getUnreadCount(userId: string) {
        return await prisma.notification.count({
            where: { userId, isRead: false }
        });
    }

    async markAsRead(notificationId: string, userId: string) {
        return await prisma.notification.update({
            where: { id: notificationId, userId },
            data: { isRead: true }
        });
    }

    async markAllAsRead(userId: string) {
        return await prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true }
        });
    }

    // Helper to send notification
    async createNotification(userId: string, title: string, message: string, type: string = 'INFO') {
        return await prisma.notification.create({
            data: {
                userId,
                title,
                message,
                type
            }
        });
    }
}

export const notificationService = new NotificationService();
