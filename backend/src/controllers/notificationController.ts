import { Response } from 'express';
import { prisma } from '../config/database';
import type { AuthRequest } from '../types';

export const subcribeToNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { endpoint, keys } = req.body;
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized: You need to login.' });
            return;
        }

        if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
            res.status(400).json({ message: 'Invalid subscription data.' });
            return;
        }

        await prisma.pushSubscription.upsert({
            where: { endpoint },
            create: { endpoint, p256dh: keys.p256dh, auth: keys.auth, userId },
            update: { p256dh: keys.p256dh, auth: keys.auth, userId },
        });

        res.status(200).json({ message: 'Subscribed to notifications successfully.' });
    } catch (error) {
        console.error('Error subscribing to notifications:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};
