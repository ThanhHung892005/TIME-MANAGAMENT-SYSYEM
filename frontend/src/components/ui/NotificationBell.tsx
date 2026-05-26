import { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { notificationService } from '@/services/notificationService';
import type { Notification } from '@/services/notificationService';

export function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const fetchNotifications = async () => {
        try {
            const data = await notificationService.getAll();
            setNotifications(data);
        } catch {
            // ignore
        }
    };

    // Polling mỗi 30 giây
    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    // Click outside để đóng
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMarkAllRead = async () => {
        await notificationService.markAllAsRead();
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    };

    const handleMarkRead = async (id: string) => {
        await notificationService.markAsRead(id);
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, isRead: true } : n)
        );
    };

    return (
        <div className="relative" ref={ref}>
            {/* Bell button */}
            <button
                onClick={() => setOpen(prev => !prev)}
                className="relative p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800 transition-colors"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                            Thông báo
                            {unreadCount > 0 && (
                                <span className="ml-2 bg-red-100 text-red-600 text-xs px-1.5 py-0.5 rounded-full">
                                    {unreadCount} mới
                                </span>
                            )}
                        </h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="text-xs text-blue-600 hover:underline"
                            >
                                Đọc tất cả
                            </button>
                        )}
                    </div>

                    {/* List */}
                    <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="py-10 text-center text-gray-400 text-sm">
                                Không có thông báo nào
                            </div>
                        ) : (
                            notifications.map(n => (
                                <div
                                    key={n.id}
                                    onClick={() => handleMarkRead(n.id)}
                                    className={`px-4 py-3 border-b border-gray-50 dark:border-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${!n.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <span className="text-lg mt-0.5">
                                            {n.type === 'OVERDUE' ? '🚨' : '⏰'}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-medium ${n.type === 'OVERDUE'
                                                ? 'text-red-600 dark:text-red-400'
                                                : 'text-yellow-600 dark:text-yellow-400'
                                                }`}>
                                                {n.title}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                                                {n.message}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {new Date(n.createdAt).toLocaleString('vi-VN')}
                                            </p>
                                        </div>
                                        {!n.isRead && (
                                            <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}