import { create } from 'zustand';

interface PomodoroSettings {
  workMinutes: number;
  breakMinutes: number;
  longBreakMinutes: number;
  mode: 'standard' | 'long' | 'custom';
}

interface SettingsStore {
  theme: 'light' | 'dark';
  pomodoro: PomodoroSettings;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  setPomodoroSettings: (settings: Partial<PomodoroSettings>) => void;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
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

  setTheme: (theme) => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    set({ theme });
  },

  setPomodoroSettings: (settings) =>
    set((state) => ({ pomodoro: { ...state.pomodoro, ...settings } })),
}));
