import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middlewares/auth';

const router = Router();
const prisma = new PrismaClient();

// GET /api/notifications
router.get('/', authenticate, async (req: any, res) => {
    try {
        const notifications = await prisma.notification.findMany({
            where: { userId: req.user.id },
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
        await prisma.notification.updateMany({
            where: { userId: req.user.id, isRead: false },
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
        await prisma.notification.update({
            where: { id: req.params.id },
            data: { isRead: true },
        });
        res.json({ success: true });
    } catch {
        res.status(500).json({ error: 'Có lỗi xảy ra' });
    }
});

export default router;