import { Router } from 'express';
import { prisma } from '../config/database';
import { authenticate } from '../middlewares/auth';
import type { AuthRequest } from '../types';

const router = Router();

// GET /api/notifications
router.get('/', authenticate, async (req: AuthRequest, res) => {
    try {
        const notifications = await prisma.notification.findMany({
            where: { userId: req.user!.userId },
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

// PATCH /api/notifications/read-all
router.patch('/read-all', authenticate, async (req: AuthRequest, res) => {
    try {
        await prisma.notification.updateMany({
            where: { userId: req.user!.userId, isRead: false },
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
        const id = req.params['id'] as string;
        const notification = await prisma.notification.findFirst({
            where: { id, userId: req.user!.userId },
        });

        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
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

export default router;
