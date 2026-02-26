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
exports.notificationService = exports.NotificationService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class NotificationService {
    getUserNotifications(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma.notification.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                take: 20
            });
        });
    }
    getUnreadCount(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma.notification.count({
                where: { userId, isRead: false }
            });
        });
    }
    markAsRead(notificationId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma.notification.update({
                where: { id: notificationId, userId },
                data: { isRead: true }
            });
        });
    }
    markAllAsRead(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma.notification.updateMany({
                where: { userId, isRead: false },
                data: { isRead: true }
            });
        });
    }
    // Helper to send notification
    createNotification(userId_1, title_1, message_1) {
        return __awaiter(this, arguments, void 0, function* (userId, title, message, type = 'INFO') {
            return yield prisma.notification.create({
                data: {
                    userId,
                    title,
                    message,
                    type
                }
            });
        });
    }
}
exports.NotificationService = NotificationService;
exports.notificationService = new NotificationService();
