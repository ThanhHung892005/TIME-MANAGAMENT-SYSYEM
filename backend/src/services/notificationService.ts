import { prisma } from '../config/database';
import { sendReminderEmail } from './emailService';
import { logger } from '../utils/logger';

const DEFAULT_REMINDER_HOURS = 24;
const BATCH_SIZE = 100;

type NotificationCheckResult = {
    checkedTasks: number;
    createdNotifications: number;
    sentEmails: number;
    failedEmails: number;
};

export const checkAndCreateNotifications = async (userId?: string) => {
    const now = new Date();
    let skip = 0;
    const result: NotificationCheckResult = {
        checkedTasks: 0,
        createdNotifications: 0,
        sentEmails: 0,
        failedEmails: 0,
    };

    while (true) {
        const users = await prisma.user.findMany({
            take: BATCH_SIZE,
            skip: userId ? 0 : skip,
            where: userId ? { id: userId } : undefined,
            include: {
                tasks: {
                    where: {
                        status: { notIn: ['COMPLETED', 'ARCHIVED'] },
                        deadline: { not: null },
                    },
                },
            },
        });

        if (users.length === 0) break;

        for (const user of users) {
            const reminderMs = DEFAULT_REMINDER_HOURS * 60 * 60 * 1000;

            for (const task of user.tasks) {
                if (!task.deadline) continue;
                result.checkedTasks += 1;

                const due = new Date(task.deadline);
                const diffMs = due.getTime() - now.getTime();
                const notifType = diffMs < 0 ? 'OVERDUE' : 'DEADLINE_SOON';

                // Avoid spam: send each warning type only once per task and user.
                const existing = await prisma.notification.findFirst({
                    where: {
                        userId: user.id,
                        taskId: task.id,
                        type: notifType,
                    },
                });
                if (existing) continue;

                if (diffMs < 0) {
                    await prisma.notification.create({
                        data: {
                            userId: user.id,
                            taskId: task.id,
                            type: 'OVERDUE',
                            title: 'Task overdue!',
                            message: `Task "${task.title}" was due on ${due.toLocaleString('vi-VN')}.`,
                        },
                    });
                    result.createdNotifications += 1;
                    if (user.emailNotifications) {
                        await sendReminderEmail(user.email, 'overdue', task.title, due)
                            .then(() => { result.sentEmails += 1; })
                            .catch(err => {
                                result.failedEmails += 1;
                                logger.error('Email error:', err);
                            });
                    }

                } else if (diffMs <= reminderMs) {
                    const hoursLeft = Math.round(diffMs / (1000 * 60 * 60));
                    await prisma.notification.create({
                        data: {
                            userId: user.id,
                            taskId: task.id,
                            type: 'DEADLINE_SOON',
                            title: 'Deadline approaching!',
                            message: `Task "${task.title}" is due in ${hoursLeft} hour(s).`,
                        },
                    });
                    result.createdNotifications += 1;
                    if (user.emailNotifications) {
                        await sendReminderEmail(user.email, 'soon', task.title, due)
                            .then(() => { result.sentEmails += 1; })
                            .catch(err => {
                                result.failedEmails += 1;
                                logger.error('Email error:', err);
                            });
                    }
                }
            }
        }

        if (userId) break;
        skip += BATCH_SIZE;
    }

    logger.info(`[Notification] Checked at ${now.toISOString()}${userId ? ` for user ${userId}` : ''}`, result);
    return result;
};
