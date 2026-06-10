import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middlewares/auth';
import { subcribeToNotifications } from '../controllers/notificationController';

const router = Router();
const prisma = new PrismaClient();

// GET /api/notifications
router.get('/', authenticate, async (req: any, res) => {
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
        });
        res.json(notifications);
    } catch {
        res.status(500).json({ error: 'Có lỗi xảy ra' });
    }
});

// PATCH /api/notifications/read-all — phải đặt TRƯỚC /:id/read
router.patch('/read-all', authenticate, async (req: any, res) => {
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
    } catch {
        res.status(500).json({ error: 'Có lỗi xảy ra' });
    }
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', authenticate, async (req: any, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        // Verify notification belongs to user before marking as read
        const notification = await prisma.notification.findFirst({
            where: { id: req.params.id, userId },
        });
        if (!notification) {
            res.status(404).json({ error: 'Notification not found' });
            return;
        }
        await prisma.notification.update({
            where: { id: req.params.id },
            data: { isRead: true },
        });
        res.json({ success: true });
    } catch {
        res.status(500).json({ error: 'Có lỗi xảy ra' });
    }
});

// POST /api/notifications/subscribe — Web Push subscription
router.post('/subscribe', authenticate, subcribeToNotifications);

export default router;