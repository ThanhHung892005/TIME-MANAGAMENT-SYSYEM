import { PrismaClient } from '@prisma/client';
import { sendReminderEmail } from './emailService';

const prisma = new PrismaClient();

const DEFAULT_REMINDER_HOURS = 24;

export const checkAndCreateNotifications = async () => {
    const now = new Date();

    const users = await prisma.user.findMany({
        include: {
            tasks: {
                where: {
                    status: { notIn: ['COMPLETED', 'ARCHIVED'] },
                    deadline: { not: null },
                },
            },
        },
    });

    for (const user of users) {
        const reminderMs = DEFAULT_REMINDER_HOURS * 60 * 60 * 1000;

        for (const task of user.tasks) {
            if (!task.deadline) continue;

            const due = new Date(task.deadline);
            const diffMs = due.getTime() - now.getTime();

            const notifType = diffMs < 0 ? 'OVERDUE' : 'DEADLINE_SOON';

            // Tránh spam: kiểm tra đã gửi trong 1h gần nhất chưa
            const existing = await prisma.notification.findFirst({
                where: {
                    userId: user.id,
                    taskId: task.id,
                    type: notifType,
                    createdAt: { gte: new Date(now.getTime() - 60 * 60 * 1000) },
                },
            });
            if (existing) continue;

            if (diffMs < 0) {
                // Task overdue
                await prisma.notification.create({
                    data: {
                        userId: user.id,
                        taskId: task.id,
                        type: 'OVERDUE',
                        title: 'Task quá hạn!',
                        message: `Task "${task.title}" đã quá hạn vào ${due.toLocaleString('vi-VN')}.`,
                    },
                });
                await sendReminderEmail(user.email, 'overdue', task.title, due);

            } else if (diffMs <= reminderMs) {
                // Task sắp deadline
                const hoursLeft = Math.round(diffMs / (1000 * 60 * 60));
                await prisma.notification.create({
                    data: {
                        userId: user.id,
                        taskId: task.id,
                        type: 'DEADLINE_SOON',
                        title: 'Sắp đến deadline!',
                        message: `Task "${task.title}" sẽ hết hạn sau ${hoursLeft} giờ.`,
                    },
                });
                await sendReminderEmail(user.email, 'soon', task.title, due);
            }
        }
    }

    console.log(`[Notification] Checked at ${now.toISOString()}`);
};