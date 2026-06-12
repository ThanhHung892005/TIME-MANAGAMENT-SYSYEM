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
  const { user, setUser, logout } = useUserStore();
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
      toast.error(error.response?.data?.message || 'Failed to delete account');
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
      setUser(updatedUser);
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
        <div className="text-gray-500">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-8">Settings</h1>

      {/* Profile Section */}
      <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <UserCircle className="w-5 h-5" />
          Profile
        </h2>
        <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-sm">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Display Name
            </label>
            <input
              type="text"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Avatar URL (Optional)
            </label>
            <input
              type="url"
              value={profileAvatar}
              onChange={(e) => setProfileAvatar(e.target.value)}
              placeholder="https://example.com/avatar.png"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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
      <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          {settings?.theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          Appearance
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-700 dark:text-gray-300">Theme</p>
            <p className="text-sm text-gray-500">Choose your preferred color scheme</p>
          </div>
          <button
            onClick={handleToggleTheme}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              settings?.theme === 'dark' ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <span
              className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                settings?.theme === 'dark' ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </section>

      {/* Pomodoro Section */}
      <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Pomodoro Timer
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block font-medium text-gray-700 dark:text-gray-300 mb-2">
              Focus Duration (minutes)
            </label>
            <div className="flex gap-2 flex-wrap">
              {[15, 20, 25, 30, 45, 60].map((mins) => (
                <button
                  key={mins}
                  onClick={() => handlePomodoroDurationChange(mins)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    settings?.pomodoroDuration === mins
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {mins}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-medium text-gray-700 dark:text-gray-300 mb-2">Timezone</label>
            <select
              value={settings?.timezone ?? 'UTC'}
              onChange={(e) => handleTimezoneChange(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
      <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notifications
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-700 dark:text-gray-300">Email Notifications</p>
              <p className="text-sm text-gray-500">Receive task reminders via email</p>
            </div>
            <button
              onClick={() => handleNotificationToggle('emailNotifications')}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                settings?.emailNotifications ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  settings?.emailNotifications ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-700 dark:text-gray-300">Push Notifications</p>
              <p className="text-sm text-gray-500">Receive browser push notifications</p>
            </div>
            <button
              onClick={() => handleNotificationToggle('pushNotifications')}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                settings?.pushNotifications ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  settings?.pushNotifications ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </section>

    {/* Security Section (Only if user has password) */}
      {user?.hasPassword && (
        <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security
          </h2>
          <form onSubmit={handleChangePassword} className="space-y-4 max-w-sm">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Current Password
              </label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 pr-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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
      <section className="bg-white dark:bg-gray-800 rounded-xl border border-red-200 dark:border-red-800 p-6">
        <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Danger Zone
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-700 dark:text-gray-300">Delete Account</p>
            <p className="text-sm text-gray-500">Permanently delete your account and all data</p>
          </div>
        </div>
        
        {showDeleteConfirm && user?.hasPassword && (
          <div className="mt-4 mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Confirm your password to delete account
            </label>
            <input
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              className="w-full max-w-sm px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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
              className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              Cancel
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
