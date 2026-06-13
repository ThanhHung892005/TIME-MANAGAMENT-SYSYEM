import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { settingsService, type UserSettings } from '@/services/settingsService';
import { authService } from '@/services/authService';
import { useSettingsStore } from '@/store/settingsStore';
import { useUserStore } from '@/store/userStore';
import { Moon, Sun, Clock, Bell, Trash2, AlertTriangle, Shield, Eye, EyeOff, UserCircle } from 'lucide-react';

export function Settings() {
  const queryClient = useQueryClient();
  const { user, setAuth, logout } = useUserStore();
  const { toggleTheme } = useSettingsStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileAvatar, setProfileAvatar] = useState(user?.avatar || '');

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsService.getSettings,
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<UserSettings>) => settingsService.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Settings saved!');
    },
    onError: () => {
      toast.error('Failed to save settings');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => settingsService.deleteAccount(user?.hasPassword ? deletePassword : undefined),
    onSuccess: async () => {
      await logout();
      window.location.href = '/login';
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || error.response?.data?.message || 'Failed to delete account');
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: authService.changePassword,
    onSuccess: () => {
      toast.success('Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to change password');
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: authService.updateProfile,
    onSuccess: (updatedUser) => {
      setAuth(updatedUser);
      toast.success('Profile updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    },
  });

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    updateProfileMutation.mutate({
      name: profileName,
      avatar: profileAvatar || undefined
    });
  };

  const handleToggleTheme = () => {
    const newTheme = settings?.theme === 'light' ? 'dark' : 'light';
    toggleTheme();
    updateMutation.mutate({ theme: newTheme });
  };

  const handlePomodoroDurationChange = (value: number) => {
    updateMutation.mutate({ pomodoroDuration: value });
  };

  const handleTimezoneChange = (value: string) => {
    updateMutation.mutate({ timezone: value });
  };

  const handleNotificationToggle = (type: 'emailNotifications' | 'pushNotifications') => {
    if (!settings) return;
    updateMutation.mutate({ [type]: !settings[type] });
  };

  const handleDeleteAccount = () => {
    if (showDeleteConfirm) {
      if (user?.hasPassword && !deletePassword) {
        toast.error('Please enter your password to confirm deletion');
        return;
      }
      deleteMutation.mutate();
    } else {
      setShowDeleteConfirm(true);
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    changePasswordMutation.mutate({ oldPassword, newPassword });
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500 dark:text-gray-400">Loading settings...</div>
      </div>
    );
  }

  const sectionClass = "bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 p-6 mb-6 shadow-sm dark:shadow-black/30";
  const inputClass = "w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400";
  const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1";
  const descClass = "text-sm text-gray-500 dark:text-gray-400";

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Settings</h1>

      {/* Profile Section */}
      <section className={sectionClass}>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <UserCircle className="w-5 h-5 text-blue-500 dark:text-blue-400" />
          Profile
        </h2>
        <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-sm">
          <div>
            <label className={labelClass}>Display Name</label>
            <input
              type="text"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Avatar URL (Optional)</label>
            <input
              type="url"
              value={profileAvatar}
              onChange={(e) => setProfileAvatar(e.target.value)}
              placeholder="https://example.com/avatar.png"
              className={inputClass}
            />
          </div>
          <Button
            type="submit"
            isLoading={updateProfileMutation.isPending}
            disabled={profileName === user?.name && profileAvatar === (user?.avatar || '')}
          >
            Save Profile
          </Button>
        </form>
      </section>

      {/* Appearance Section */}
      <section className={sectionClass}>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          {settings?.theme === 'dark'
            ? <Moon className="w-5 h-5 text-blue-400" />
            : <Sun className="w-5 h-5 text-yellow-500" />}
          Appearance
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-800 dark:text-gray-100">Theme</p>
            <p className={descClass}>Choose your preferred color scheme</p>
          </div>
          <button
            onClick={handleToggleTheme}
            aria-label="Toggle theme"
            className={`relative w-12 h-6 rounded-full transition-colors overflow-hidden ${
              settings?.theme === 'dark' ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-500'
            }`}
          >
            <span
              className={`absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                settings?.theme === 'dark' ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </section>

      {/* Pomodoro Section */}
      <section className={sectionClass}>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-orange-500 dark:text-orange-400" />
          Pomodoro Timer
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block font-medium text-gray-800 dark:text-gray-100 mb-2">
              Focus Duration (minutes)
            </label>
            <div className="flex gap-2 flex-wrap">
              {[15, 20, 25, 30, 45, 60].map((mins) => (
                <button
                  key={mins}
                  onClick={() => handlePomodoroDurationChange(mins)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    settings?.pomodoroDuration === mins
                      ? 'bg-blue-600 dark:bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 border border-transparent dark:border-gray-600'
                  }`}
                >
                  {mins}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-medium text-gray-800 dark:text-gray-100 mb-2">Timezone</label>
            <select
              value={settings?.timezone ?? 'UTC'}
              onChange={(e) => handleTimezoneChange(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-500 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            >
              <option value="UTC">UTC</option>
              <option value="Asia/Saigon">Asia/Ho Chi Minh (GMT+7)</option>
              <option value="Asia/Tokyo">Asia/Tokyo (GMT+9)</option>
              <option value="America/New_York">America/New York (GMT-5)</option>
              <option value="Europe/London">Europe/London (GMT+0)</option>
            </select>
          </div>
        </div>
      </section>

      {/* Notifications Section */}
      <section className={sectionClass}>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-purple-500 dark:text-purple-400" />
          Notifications
        </h2>
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800 dark:text-gray-100">Email Notifications</p>
              <p className={descClass}>Receive task reminders via email</p>
            </div>
            <button
              onClick={() => handleNotificationToggle('emailNotifications')}
              aria-label="Toggle email notifications"
              className={`relative w-12 h-6 rounded-full transition-colors overflow-hidden ${
                settings?.emailNotifications ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-500'
              }`}
            >
              <span
                className={`absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  settings?.emailNotifications ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800 dark:text-gray-100">Push Notifications</p>
              <p className={descClass}>Receive browser push notifications</p>
            </div>
            <button
              onClick={() => handleNotificationToggle('pushNotifications')}
              aria-label="Toggle push notifications"
              className={`relative w-12 h-6 rounded-full transition-colors overflow-hidden ${
                settings?.pushNotifications ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-500'
              }`}
            >
              <span
                className={`absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  settings?.pushNotifications ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      {/* Security Section (Only if user has password) */}
      {user?.hasPassword && (
        <section className={sectionClass}>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-500 dark:text-green-400" />
            Security
          </h2>
          <form onSubmit={handleChangePassword} className="space-y-4 max-w-sm">
            <div>
              <label className={labelClass}>Current Password</label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={`${inputClass} pr-10`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className={labelClass}>Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputClass}
                required
              />
            </div>
            <Button
              type="submit"
              isLoading={changePasswordMutation.isPending}
              disabled={!oldPassword || !newPassword || !confirmPassword}
            >
              Change Password
            </Button>
          </form>
        </section>
      )}

      {/* Danger Zone */}
      <section className="bg-white dark:bg-gray-800 rounded-xl border border-red-200 dark:border-red-700 p-6 shadow-sm dark:shadow-black/30">
        <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Danger Zone
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-800 dark:text-gray-100">Delete Account</p>
            <p className={descClass}>Permanently delete your account and all data</p>
          </div>
        </div>

        {showDeleteConfirm && user?.hasPassword && (
          <div className="mt-4 mb-4">
            <label className={labelClass}>
              Confirm your password to delete account
            </label>
            <input
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              className={`${inputClass} max-w-sm`}
              placeholder="Enter password"
            />
          </div>
        )}

        <div className="flex items-center gap-3 mt-4">
          <Button
            variant="danger"
            onClick={handleDeleteAccount}
            isLoading={deleteMutation.isPending}
            className={showDeleteConfirm ? 'bg-red-600 hover:bg-red-700' : ''}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {showDeleteConfirm ? 'Confirm Delete' : 'Delete Account'}
          </Button>
          {showDeleteConfirm && (
            <button
              onClick={() => {
                setShowDeleteConfirm(false);
                setDeletePassword('');
              }}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              Cancel
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
