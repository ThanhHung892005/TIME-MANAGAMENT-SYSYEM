import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { KeyboardShortcutsModal } from '@/components/ui/KeyboardShortcutsModal';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { NotificationBell } from '@/components/ui/NotificationBell';
import { settingsService } from '@/services/settingsService';
import { useSettingsStore } from '@/store/settingsStore';

export function AppLayout() {
  const [showShortcuts, setShowShortcuts] = useState(false);
  const { setTheme, setPomodoroSettings } = useSettingsStore();
  useKeyboardShortcuts(() => setShowShortcuts(true));

  useEffect(() => {
    settingsService.getSettings().then((s) => {
      setTheme(s.theme);
      setPomodoroSettings({ workMinutes: s.pomodoroDuration });
    }).catch(() => {
      // silently ignore — local defaults remain
    });
  }, []);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-end px-4 py-2 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <NotificationBell />
        </div>
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
      <KeyboardShortcutsModal isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />
    </div>
  );
}