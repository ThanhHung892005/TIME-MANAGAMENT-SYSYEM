import webpush from 'web-push';
import { prisma } from '../config/database';
import { OverdueTaskPayload } from '../events/taskEvents';

webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:example@yourdomain.org',
    process.env.VAPID_PUBLIC_KEY || '',
    process.env.VAPID_PRIVATE_KEY || ''
);

export const sendOverdueAlerts = async (overdueTasks: OverdueTaskPayload[]) => {
    for (const task of overdueTasks) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: task.userId },
                include: { pushSubscriptions: true },
            });
            if (!user || user.pushSubscriptions.length === 0) continue;

            const payload = JSON.stringify({
                title: 'Task Overdue',
                body: `Your task "${task.title}" is overdue. Check it now!`,
                url: '/tasks',
            });

            for (const sub of user.pushSubscriptions) {
                const pushSubscription = {
                    endpoint: sub.endpoint,
                    keys: { p256dh: sub.p256dh, auth: sub.auth },
                };
                await webpush.sendNotification(pushSubscription, payload).catch(async (err: any) => {
                    if (err.statusCode === 410) {
                        await prisma.pushSubscription.delete({ where: { id: sub.id } });
                    } else {
                        console.error('Error sending push notification:', err);
                    }
                });
            }
        } catch (error) {
            console.error('Error processing overdue push alert:', error);
        }
    }
};
