import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useUserStore } from '@/store/userStore';
import { authService } from '@/services/authService';

export function AuthCallback() {
  const navigate = useNavigate();
  const { setAuth } = useUserStore();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');

    if (error) {
      toast.error('Google sign-in failed. Please try again.');
      navigate('/login', { replace: true });
      return;
    }

    // Token is now in httpOnly cookie - just fetch profile
    authService
      .getProfile()
      .then((user) => {
        setAuth(user);
        navigate('/dashboard', { replace: true });
      })
      .catch(() => {
        toast.error('Could not load profile. Please sign in again.');
        navigate('/login', { replace: true });
      });
  }, [navigate, setAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-500">Signing you in…</p>
      </div>
    </div>
  );
}
