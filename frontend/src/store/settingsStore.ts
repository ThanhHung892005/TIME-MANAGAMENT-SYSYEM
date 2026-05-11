import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PomodoroSettings {
  workMinutes: number;
  breakMinutes: number;
  longBreakMinutes: number;
  mode: 'standard' | 'long' | 'custom';
}

interface SettingsStore {
  theme: 'light' | 'dark';
  pomodoro: PomodoroSettings;
  toggleTheme: () => void;
  setPomodoroSettings: (settings: Partial<PomodoroSettings>) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      theme: 'light',
      pomodoro: {
        workMinutes: 25,
        breakMinutes: 5,
        longBreakMinutes: 15,
        mode: 'standard',
      },

      toggleTheme: () => {
        const next = get().theme === 'light' ? 'dark' : 'light';
        document.documentElement.classList.toggle('dark', next === 'dark');
        set({ theme: next });
      },

      setPomodoroSettings: (settings) =>
        set((state) => ({ pomodoro: { ...state.pomodoro, ...settings } })),
    }),
    {
      name: 'time-mgmt-settings',
      onRehydrateStorage: () => (state) => {
        if (state?.theme === 'dark') {
          document.documentElement.classList.add('dark');
        }
      },
    },
  ),
);
