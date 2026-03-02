"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markRead = exports.getNotifications = void 0;
const notification_service_1 = require("../services/notification.service");
const getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const notifications = await notification_service_1.notificationService.getUserNotifications(userId);
        const unreadCount = await notification_service_1.notificationService.getUnreadCount(userId);
        res.json({ notifications, unreadCount });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
};
exports.getNotifications = getNotifications;
const markRead = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.body;
        if (id === 'all') {
            await notification_service_1.notificationService.markAllAsRead(userId);
        }
        else {
            await notification_service_1.notificationService.markAsRead(id, userId);
        }
        res.json({ message: 'Marked as read' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update notification' });
    }
};
exports.markRead = markRead;
