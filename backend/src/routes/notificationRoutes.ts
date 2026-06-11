import { Router } from 'express';
import { prisma } from '../config/database';
import { authenticate } from '../middlewares/auth';
import { subcribeToNotifications } from '../controllers/notificationController';
import type { AuthRequest } from '../types';

const router = Router();

// GET /api/notifications
router.get('/', authenticate, async (req: AuthRequest, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const notifications = await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50,
            select: {
                id: true,
                userId: true,
                taskId: true,
                type: true,
                title: true,
                message: true,
                isRead: true,
                createdAt: true,
            },
        });
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PATCH /api/notifications/read-all — must be before /:id/read
router.patch('/read-all', authenticate, async (req: AuthRequest, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        await prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', authenticate, async (req: AuthRequest, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const id = String(req.params.id);
        const notification = await prisma.notification.findFirst({
            where: { id, userId },
        });
        if (!notification) {
            res.status(404).json({ error: 'Notification not found' });
            return;
        }
        await prisma.notification.update({
            where: { id },
            data: { isRead: true },
        });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/notifications/subscribe — Web Push subscription
router.post('/subscribe', authenticate, subcribeToNotifications);

export default router;
