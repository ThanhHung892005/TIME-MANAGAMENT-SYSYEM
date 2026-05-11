import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { authService } from '@/services/authService';
import { useUserStore } from '@/store/userStore';

export function useAuth() {
  const { user, token, setAuth, logout } = useUserStore();

  const { data, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: authService.getProfile,
    enabled: !!token && !user,
    retry: false,
  });

  useEffect(() => {
    if (data && token) setAuth(data, token);
  }, [data, token, setAuth]);

  return { user, isLoading, isAuthenticated: !!user || !!token, logout };
}
