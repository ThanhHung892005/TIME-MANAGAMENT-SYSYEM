import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { ResetPassword } from '@/pages/ResetPassword';
import { authService } from '@/services/authService';
import { MemoryRouter } from 'react-router-dom';
import toast from 'react-hot-toast';

vi.mock('@/services/authService');
vi.mock('react-hot-toast');

const renderWithRouter = (ui: React.ReactElement, token = 'test-reset-token') => {
  return render(
    <MemoryRouter initialEntries={[`/reset-password?token=${token}`]}>
      {ui}
    </MemoryRouter>
  );
};

describe('ResetPassword', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authService.resetPassword).mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders password inputs', () => {
    renderWithRouter(<ResetPassword />);

    expect(screen.getByLabelText(/^mật khẩu mới$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/xác nhận mật khẩu mới/i)).toBeInTheDocument();
  });

  it('shows all password requirements when typing', () => {
    renderWithRouter(<ResetPassword />);

    const passwordInput = screen.getByLabelText(/^mật khẩu mới$/i);
    fireEvent.change(passwordInput, { target: { value: 'Ab' } });

    expect(screen.getByText(/ít nhất 8 ký tự/i)).toBeInTheDocument();
    expect(screen.getByText(/ít nhất 1 chữ hoa/i)).toBeInTheDocument();
    expect(screen.getByText(/ít nhất 1 chữ thường/i)).toBeInTheDocument();
    expect(screen.getByText(/ít nhất 1 số/i)).toBeInTheDocument();
    expect(screen.getByText(/ít nhất 1 ký tự đặc biệt/i)).toBeInTheDocument();
  });

  it('shows password mismatch error when passwords differ', () => {
    renderWithRouter(<ResetPassword />);

    const passwordInput = screen.getByLabelText(/^mật khẩu mới$/i);
    const confirmInput = screen.getByLabelText(/xác nhận mật khẩu mới/i);

    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    fireEvent.change(confirmInput, { target: { value: 'DifferentPass123!' } });

    expect(screen.getByText(/mật khẩu không khớp/i)).toBeInTheDocument();
  });

  it('calls resetPassword API with valid data', async () => {
    vi.mocked(authService.resetPassword).mockResolvedValue({
      message: 'Password has been reset successfully',
    });

    renderWithRouter(<ResetPassword />);

    const passwordInput = screen.getByLabelText(/^mật khẩu mới$/i);
    const confirmInput = screen.getByLabelText(/xác nhận mật khẩu mới/i);

    fireEvent.change(passwordInput, { target: { value: 'NewPassword123!' } });
    fireEvent.change(confirmInput, { target: { value: 'NewPassword123!' } });

    // Use getAllBy to get first matching button
    const submitButtons = screen.getAllByRole('button', { name: /đặt lại mật khẩu/i });
    fireEvent.click(submitButtons[0]);

    await waitFor(() => {
      expect(authService.resetPassword).toHaveBeenCalledWith(
        'test-reset-token',
        'NewPassword123!'
      );
    });
  });

  it('shows success toast on successful reset', async () => {
    vi.mocked(authService.resetPassword).mockResolvedValue({
      message: 'Password has been reset successfully',
    });

    renderWithRouter(<ResetPassword />);

    const passwordInput = screen.getByLabelText(/^mật khẩu mới$/i);
    const confirmInput = screen.getByLabelText(/xác nhận mật khẩu mới/i);

    fireEvent.change(passwordInput, { target: { value: 'NewPassword123!' } });
    fireEvent.change(confirmInput, { target: { value: 'NewPassword123!' } });

    const submitButtons = screen.getAllByRole('button', { name: /đặt lại mật khẩu/i });
    fireEvent.click(submitButtons[0]);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Đặt lại mật khẩu thành công!');
    });
  });

  it('shows error toast on API failure', async () => {
    vi.mocked(authService.resetPassword).mockRejectedValue({
      response: { data: { error: 'Invalid or expired token' } },
    });

    renderWithRouter(<ResetPassword />);

    const passwordInput = screen.getByLabelText(/^mật khẩu mới$/i);
    const confirmInput = screen.getByLabelText(/xác nhận mật khẩu mới/i);

    fireEvent.change(passwordInput, { target: { value: 'NewPassword123!' } });
    fireEvent.change(confirmInput, { target: { value: 'NewPassword123!' } });

    const submitButtons = screen.getAllByRole('button', { name: /đặt lại mật khẩu/i });
    fireEvent.click(submitButtons[0]);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Invalid or expired token');
    });
  });

  it('disables submit button when password is invalid', () => {
    renderWithRouter(<ResetPassword />);

    const passwordInput = screen.getByLabelText(/^mật khẩu mới$/i);
    const confirmInput = screen.getByLabelText(/xác nhận mật khẩu mới/i);

    fireEvent.change(passwordInput, { target: { value: 'weak' } });
    fireEvent.change(confirmInput, { target: { value: 'weak' } });

    const submitButtons = screen.getAllByRole('button', { name: /đặt lại mật khẩu/i });
    expect(submitButtons[0]).toBeDisabled();
  });

  it('disables submit button when passwords do not match', () => {
    renderWithRouter(<ResetPassword />);

    const passwordInput = screen.getByLabelText(/^mật khẩu mới$/i);
    const confirmInput = screen.getByLabelText(/xác nhận mật khẩu mới/i);

    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    fireEvent.change(confirmInput, { target: { value: 'DifferentPass123!' } });

    const submitButtons = screen.getAllByRole('button', { name: /đặt lại mật khẩu/i });
    expect(submitButtons[0]).toBeDisabled();
  });
});
