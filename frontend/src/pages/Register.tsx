import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { GoogleSignInButton } from '@/components/ui/GoogleSignInButton';
import { authService } from '@/services/authService';
import { useUserStore } from '@/store/userStore';

import { useState } from 'react';

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email'),
  password: z.string()
    .min(8, 'Ít nhất 8 ký tự')
    .regex(/[A-Z]/, 'Ít nhất 1 chữ hoa')
    .regex(/[a-z]/, 'Ít nhất 1 chữ thường')
    .regex(/[0-9]/, 'Ít nhất 1 số')
    .regex(/[^A-Za-z0-9]/, 'Ít nhất 1 ký tự đặc biệt'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

const otpSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

type FormValues = z.infer<typeof schema>;
type OtpValues = z.infer<typeof otpSchema>;

export function Register() {
  const navigate = useNavigate();
  const { setAuth } = useUserStore();
  const [step, setStep] = useState<1 | 2 | 3>(1); // 3 = success
  const [formData, setFormData] = useState<FormValues | null>(null);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const passwordRequirements = [
    { test: (p: string) => p.length >= 8, label: 'Ít nhất 8 ký tự' },
    { test: (p: string) => /[A-Z]/.test(p), label: 'Ít nhất 1 chữ hoa' },
    { test: (p: string) => /[a-z]/.test(p), label: 'Ít nhất 1 chữ thường' },
    { test: (p: string) => /[0-9]/.test(p), label: 'Ít nhất 1 số' },
    { test: (p: string) => /[^A-Za-z0-9]/.test(p), label: 'Ít nhất 1 ký tự đặc biệt' },
  ];

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
  });

  const watchPassword = watch('password', '');

  const { register: registerOtp, handleSubmit: handleOtpSubmit, formState: { errors: otpErrors, isSubmitting: isVerifying } } = useForm<OtpValues>({
    resolver: zodResolver(otpSchema),
  });

  const handleSendOtp = async (data: FormValues) => {
    setIsSendingOtp(true);
    try {
      await authService.sendRegisterOtp(data.email);
      setFormData(data);
      setStep(2);
      toast.success('OTP đã được gửi đến email của bạn!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Gửi OTP thất bại. Email có thể đã được sử dụng.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleRegister = async (otpData: OtpValues) => {
    if (!formData) return;
    try {
      const result = await authService.register({
        ...formData,
        otp: otpData.otp,
      });
      setAuth(result.user);
      setStep(3);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Mã OTP không hợp lệ hoặc đã hết hạn.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        {step === 3 ? (
          // Success state
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Đăng ký thành công!
            </h1>
            <p className="text-sm text-gray-500 mb-6">
              Tài khoản của bạn đã được tạo. Bây giờ bạn có thể đăng nhập.
            </p>
            <Button
              onClick={() => navigate('/login')}
              className="w-full"
            >
              Đăng nhập
            </Button>
            <p className="text-center text-sm text-gray-500 mt-4">
              <Link to="/register" className="text-blue-600 hover:underline">
                Quay lại đăng ký
              </Link>
            </p>
          </div>
        ) : (
          <>
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {step === 1 ? 'Tạo tài khoản' : 'Xác thực email'}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {step === 1 ? 'Bắt đầu quản lý thời gian ngay hôm nay' : 'Nhập mã 6 chữ số đã gửi đến email của bạn'}
              </p>
            </div>

            {step === 1 ? (
              <form onSubmit={handleSubmit(handleSendOtp)} className="space-y-4">
                <Input label="Tên" error={errors.name?.message} {...register('name')} />
                <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      {...register('password')}
                      className={`w-full px-4 py-2 pr-12 rounded-lg border ${
                        errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {watchPassword && (
                    <ul className="mt-2 space-y-1">
                      {passwordRequirements.map((req, idx) => (
                        <li
                          key={idx}
                          className={`text-xs flex items-center gap-2 ${
                            req.test(watchPassword) ? 'text-green-600' : 'text-gray-500'
                          }`}
                        >
                          {req.test(watchPassword) ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                          {req.label}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <Input label="Xác nhận mật khẩu" type="password" error={errors.confirmPassword?.message} {...register('confirmPassword')} />
                <Button type="submit" isLoading={isSendingOtp} className="w-full mt-2">
                  Tiếp tục
                </Button>
              </form>
            ) : (
              <form onSubmit={handleOtpSubmit(handleRegister)} className="space-y-4">
                <Input
                  label="Mã OTP"
                  placeholder="123456"
                  error={otpErrors.otp?.message}
                  {...registerOtp('otp')}
                />
                <Button type="submit" isLoading={isVerifying} className="w-full mt-2">
                  Xác thực & Đăng ký
                </Button>
                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Quay lại
                  </button>
                </div>
              </form>
            )}

            {step === 1 && (
              <>
                <div className="relative my-5">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-200 dark:border-gray-700" />
                  </div>
                  <div className="relative flex justify-center text-xs text-gray-400 uppercase tracking-wide">
                    <span className="bg-white dark:bg-gray-900 px-2">hoặc</span>
                  </div>
                </div>

                <GoogleSignInButton label="Đăng ký với Google" />

                <p className="text-center text-sm text-gray-500 mt-6">
                  Đã có tài khoản?{' '}
                  <Link to="/login" className="text-blue-600 hover:underline font-medium">
                    Đăng nhập
                  </Link>
                </p>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
