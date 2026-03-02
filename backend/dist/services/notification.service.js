"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationService = exports.NotificationService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class NotificationService {
    async getUserNotifications(userId) {
        return await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 20
        });
    }
    async getUnreadCount(userId) {
        return await prisma.notification.count({
            where: { userId, isRead: false }
        });
    }
    async markAsRead(notificationId, userId) {
        return await prisma.notification.update({
            where: { id: notificationId, userId },
            data: { isRead: true }
        });
    }
    async markAllAsRead(userId) {
        return await prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true }
        });
    }
    // Helper to send notification
    async createNotification(userId, title, message, type = 'INFO') {
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
exports.NotificationService = NotificationService;
exports.notificationService = new NotificationService();
