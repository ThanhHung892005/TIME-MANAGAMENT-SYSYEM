import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';
import { authService } from '@/services/authService';

interface UserStore {
  user: User | null;
  isLoading: boolean;
  setAuth: (user: User) => void;
  logout: () => Promise<void>;
  setLoading: (loading: boolean) => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,

      setAuth: (user) => set({ user }),

      logout: async () => {
        try {
          await authService.logout();
        } catch {
          // Ignore logout errors, clear state anyway
        }
        set({ user: null });
      },

      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'auth-user',
      partialize: (state) => ({ user: state.user }),
    },
  ),
);
