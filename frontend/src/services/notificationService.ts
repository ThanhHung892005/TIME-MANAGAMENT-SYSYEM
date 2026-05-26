import { api } from '@/lib/api';

export interface Notification {
    id: string;
    taskId?: string;
    type: 'DEADLINE_SOON' | 'OVERDUE';
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
}

class NotificationService {
    async getAll(): Promise<Notification[]> {
        const res = await api.get<Notification[]>('/notifications');
        return res.data;
    }

    async markAsRead(id: string): Promise<void> {
        await api.patch(`/notifications/${id}/read`);
    }

    async markAllAsRead(): Promise<void> {
        await api.patch('/notifications/read-all');
    }
}

export const notificationService = new NotificationService();