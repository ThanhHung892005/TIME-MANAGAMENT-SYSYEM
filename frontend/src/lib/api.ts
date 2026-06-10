import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // Important: send cookies to backend
});

api.interceptors.request.use((config) => {
  // Token is now stored in httpOnly cookie, no need to read from localStorage
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear cookie and redirect to login only if it's not an auth endpoint
      const url = error.config?.url || '';
      if (!url.startsWith('/auth/login') && !url.startsWith('/auth/register') && !url.startsWith('/auth/send-register-otp') && !url.startsWith('/auth/forgot-password') && !url.startsWith('/auth/reset-password') && !url.startsWith('/auth/me')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);
