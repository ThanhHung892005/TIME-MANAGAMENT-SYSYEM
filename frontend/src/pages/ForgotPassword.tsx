import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '@/services/authService';
import toast from 'react-hot-toast';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await authService.forgotPassword(email);
      setSubmitted(true);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Gửi email thất bại. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsLoading(true);
    try {
      await authService.forgotPassword(email);
      toast.success('Đã gửi lại link đặt lại mật khẩu');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Gửi lại thất bại. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Kiểm tra email của bạn</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            Nếu email tồn tại trong hệ thống, chúng tôi đã gửi link đặt lại mật khẩu.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
            Link sẽ hết hạn sau 1 giờ.
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            <span className="font-medium">{email}</span>
          </p>
          <button
            onClick={handleResend}
            disabled={isLoading}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm disabled:opacity-50 mb-4"
          >
            {isLoading ? 'Đang gửi...' : 'Gửi lại email'}
          </button>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
            <Link
              to="/login"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Quay lại đăng nhập
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Quên mật khẩu?</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Nhập email đã đăng ký để nhận link đặt lại mật khẩu
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
          >
            {isLoading ? 'Đang gửi...' : 'Gửi link đặt lại'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          >
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
