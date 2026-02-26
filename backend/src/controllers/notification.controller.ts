import { Request, Response } from 'express';
import { notificationService } from '../services/notification.service';

export const getNotifications = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const notifications = await notificationService.getUserNotifications(userId);
        const unreadCount = await notificationService.getUnreadCount(userId);
        res.json({ notifications, unreadCount });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
};

export const markRead = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const { id } = req.body;

        if (id === 'all') {
            await notificationService.markAllAsRead(userId);
        } else {
            await notificationService.markAsRead(id, userId);
        }
        res.json({ message: 'Marked as read' });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to update notification' });
    }
};
