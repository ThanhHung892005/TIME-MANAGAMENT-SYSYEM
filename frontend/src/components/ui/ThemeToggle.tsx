import { Moon, Sun } from 'lucide-react';
import { useSettingsStore } from '@/store/settingsStore';

export function ThemeToggle() {
  const { theme, toggleTheme } = useSettingsStore();
  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5 text-yellow-400" />
      ) : (
        <Moon className="w-5 h-5 text-gray-600" />
      )}
    </button>
  );
}
