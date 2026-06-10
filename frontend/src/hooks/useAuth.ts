import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { authService } from '@/services/authService';
import { useUserStore } from '@/store/userStore';

export function useAuth() {
  const { user, setAuth, logout } = useUserStore();

  const { data, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: authService.getProfile,
    enabled: !user,
    retry: false,
  });

  useEffect(() => {
    if (data) {
      setAuth(data);
    }
  }, [data, setAuth]);

  return { user, isLoading, isAuthenticated: !!user, logout };
}
