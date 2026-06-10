import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { ForgotPassword } from '@/pages/ForgotPassword';
import { authService } from '@/services/authService';
import { MemoryRouter } from 'react-router-dom';
import toast from 'react-hot-toast';

vi.mock('@/services/authService');
vi.mock('react-hot-toast');

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
};

describe('ForgotPassword', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authService.forgotPassword).mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders email input and submit button', () => {
    renderWithRouter(<ForgotPassword />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /gửi link đặt lại/i })).toBeInTheDocument();
  });

  it('calls forgotPassword API on submit', async () => {
    vi.mocked(authService.forgotPassword).mockResolvedValue({
      message: 'If email exists, a reset link has been sent.',
    });

    renderWithRouter(<ForgotPassword />);

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /gửi link đặt lại/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(authService.forgotPassword).toHaveBeenCalledWith('test@example.com');
    });
  });

  it('shows success message after successful submission', async () => {
    vi.mocked(authService.forgotPassword).mockResolvedValue({
      message: 'If email exists, a reset link has been sent.',
    });

    renderWithRouter(<ForgotPassword />);

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /gửi link đặt lại/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/kiểm tra email của bạn/i)).toBeInTheDocument();
    });
  });

  it('shows entered email in success state', async () => {
    vi.mocked(authService.forgotPassword).mockResolvedValue({
      message: 'If email exists, a reset link has been sent.',
    });

    renderWithRouter(<ForgotPassword />);

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /gửi link đặt lại/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });
  });

  it('shows error toast on API failure', async () => {
    const errorMessage = 'Failed to send reset email';
    vi.mocked(authService.forgotPassword).mockRejectedValue({
      response: { data: { error: errorMessage } },
    });

    renderWithRouter(<ForgotPassword />);

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /gửi link đặt lại/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(errorMessage);
    });
  });

  it('has link back to login', () => {
    renderWithRouter(<ForgotPassword />);

    const loginLink = screen.getByRole('link', { name: /quay lại đăng nhập/i });
    expect(loginLink).toHaveAttribute('href', '/login');
  });

  it('shows resend button in success state', async () => {
    vi.mocked(authService.forgotPassword).mockResolvedValue({
      message: 'If email exists, a reset link has been sent.',
    });

    renderWithRouter(<ForgotPassword />);

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /gửi link đặt lại/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/gửi lại email/i)).toBeInTheDocument();
    });
  });

  it('can resend email after initial submission', async () => {
    vi.mocked(authService.forgotPassword).mockResolvedValue({
      message: 'If email exists, a reset link has been sent.',
    });

    renderWithRouter(<ForgotPassword />);

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /gửi link đặt lại/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/gửi lại email/i)).toBeInTheDocument();
    });

    const resendButton = screen.getByText(/gửi lại email/i);
    fireEvent.click(resendButton);

    await waitFor(() => {
      expect(authService.forgotPassword).toHaveBeenCalledTimes(2);
      expect(toast.success).toHaveBeenCalledWith('Đã gửi lại link đặt lại mật khẩu');
    });
  });
});
