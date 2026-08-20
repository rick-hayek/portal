'use client';

import { signIn, useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';

interface ProfileData {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: string;
  receiveNotifications: boolean;
  isEmailServiceConfigured: boolean;
  hasPassword: boolean;
}

export default function ProfilePage() {
  const t = useTranslations('Profile');
  const { status, update } = useSession();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Profile Form states
  const [displayName, setDisplayName] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
  const [profileSubmitting, setProfileSubmitting] = useState(false);

  // Notification Preference states
  const [receiveNotifications, setReceiveNotifications] = useState(true);
  const [notifSubmitting, setNotifSubmitting] = useState(false);
  const [notifSuccessMsg, setNotifSuccessMsg] = useState('');
  const [notifError, setNotifError] = useState('');

  // Password Form states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState('');
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      const res = await fetch('/api/trpc/profile.getProfile?batch=1');
      const data = await res.json();
      const profileData = data[0]?.result?.data?.json;
      if (profileData) {
        setProfile(profileData);
        setDisplayName(profileData.name ?? '');
        setReceiveNotifications(profileData.receiveNotifications ?? true);
      } else if (data[0]?.error) {
        setError(data[0].error.json?.message ?? 'Failed to load profile');
      }
    } catch {
      setError('Failed to fetch profile details');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'authenticated') {
      loadProfile();
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [status, loadProfile]);

  async function handleProfileUpdate(e: React.FormEvent) {
    e.preventDefault();
    setProfileError('');
    setProfileSuccessMsg('');

    const trimmedName = displayName.trim();
    if (!trimmedName) {
      setProfileError(t('validation.nameRequired'));
      return;
    }

    setProfileSubmitting(true);

    try {
      const res = await fetch('/api/trpc/profile.updateProfile?batch=1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          '0': {
            json: {
              name: trimmedName,
            },
          },
        }),
      });
      const data = await res.json();

      if (data[0]?.error) {
        setProfileError(data[0].error.json?.message ?? 'Failed to update display name');
      } else {
        setProfileSuccessMsg(t('profileSuccess'));
        setProfile((prev) => (prev ? { ...prev, name: trimmedName } : null));
        // Sync NextAuth session so Header/Navbar immediately reflects the change
        await update({ name: trimmedName });
      }
    } catch {
      setProfileError('Network error. Please try again.');
    } finally {
      setProfileSubmitting(false);
    }
  }

  async function handleNotificationToggle(checked: boolean) {
    setReceiveNotifications(checked);
    setNotifError('');
    setNotifSuccessMsg('');
    setNotifSubmitting(true);
    try {
      const res = await fetch('/api/trpc/profile.updateNotificationSettings?batch=1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          '0': {
            json: {
              receiveNotifications: checked,
            },
          },
        }),
      });
      const data = await res.json();
      if (data[0]?.error) {
        setNotifError(data[0].error.json?.message ?? 'Failed to update settings');
        // Rollback state if server update fails
        setReceiveNotifications(!checked);
      } else {
        setNotifSuccessMsg(t('notificationSuccess'));
        setTimeout(() => setNotifSuccessMsg(''), 3000);
      }
    } catch {
      setNotifError('Network error. Please try again.');
      setReceiveNotifications(!checked);
    } finally {
      setNotifSubmitting(false);
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccessMsg('');

    if (profile?.hasPassword && !currentPassword) {
      setPasswordError(t('placeholders.currentPassword'));
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError(t('validation.minLength'));
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(t('validation.mismatch'));
      return;
    }

    setPasswordSubmitting(true);

    try {
      const res = await fetch('/api/trpc/profile.changePassword?batch=1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          '0': {
            json: {
              currentPassword: currentPassword || undefined,
              newPassword,
            },
          },
        }),
      });
      const data = await res.json();

      if (data[0]?.error) {
        setPasswordError(data[0].error.json?.message ?? 'Failed to update password');
      } else {
        setPasswordSuccessMsg(t('success'));
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        // Reload profile to refresh hasPassword state
        await loadProfile();
      }
    } catch {
      setPasswordError('Network error. Please try again.');
    } finally {
      setPasswordSubmitting(false);
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--portal-color-primary)] border-t-transparent" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="mx-auto max-w-md px-8 py-20 text-center">
        <div className="rounded-2xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] p-8 shadow-md">
          <span className="text-5xl block mb-4">🔒</span>
          <h2 className="text-xl font-bold text-[var(--portal-color-text)] mb-2">Access Denied</h2>
          <p className="text-sm text-[var(--portal-color-text-secondary)] mb-6">
            Please sign in to view and manage your profile settings.
          </p>
          <button
            onClick={() => signIn()}
            className="w-full rounded-lg bg-[var(--portal-color-primary)] py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 cursor-pointer"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="mx-auto max-w-xl px-8 py-16 text-center">
        <div className="rounded-xl bg-red-500/10 p-6 text-red-500">
          {error || 'Failed to load user profile'}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[800px] px-8 py-16">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-[var(--portal-color-text)] mb-2">
          {t('title')}
        </h1>
        <p className="text-sm text-[var(--portal-color-text-secondary)]">{t('subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-8 items-start">
        {/* Left Side: Account Info Summary */}
        <div className="rounded-2xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] p-6 shadow-sm flex flex-col items-center text-center">
          {profile.image ? (
            <img
              src={profile.image}
              alt={profile.name ?? 'User'}
              className="h-20 w-20 rounded-full border border-compat object-cover mb-4"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--portal-color-primary)] text-3xl font-bold text-white mb-4">
              {(profile.name ?? profile.email ?? 'U')[0].toUpperCase()}
            </div>
          )}

          <h3 className="font-bold text-[var(--portal-color-text)] truncate w-full px-1">
            {profile.name ?? 'User'}
          </h3>
          <p className="text-xs text-[var(--portal-color-text-secondary)] truncate w-full px-1 mb-4">
            {profile.email}
          </p>

          <span className="inline-block rounded-full bg-[var(--portal-color-primary-soft)] px-3 py-1 text-[0.68rem] font-semibold text-[var(--portal-color-primary)] uppercase tracking-wider">
            {profile.role}
          </span>
        </div>

        {/* Right Side: Forms */}
        <div className="space-y-6">
          {/* Edit Display Name Card */}
          <div className="rounded-2xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] p-6 md:p-8 shadow-sm">
            <h2 className="text-lg font-bold text-[var(--portal-color-text)] mb-1">
              {t('profileInfo')}
            </h2>
            <p className="text-xs text-[var(--portal-color-text-secondary)] leading-relaxed mb-4">
              {t('profileInfoDesc')}
            </p>

            {profileError && (
              <div className="rounded-lg bg-red-500/10 p-3 text-xs text-red-500 mb-4">
                {profileError}
              </div>
            )}

            {profileSuccessMsg && (
              <div className="rounded-lg bg-green-500/10 p-3 text-xs text-green-600 dark:text-green-400 mb-4">
                {profileSuccessMsg}
              </div>
            )}

            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-[var(--portal-color-text-secondary)]">
                    {t('fields.name')}
                  </label>
                  <span className="text-[10px] text-[var(--portal-color-text-tertiary)] font-mono">
                    {displayName.length}/50
                  </span>
                </div>
                <input
                  type="text"
                  required
                  maxLength={50}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={t('placeholders.name')}
                  className="w-full rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-background)] px-3 py-2 text-sm text-[var(--portal-color-text)] focus:border-[var(--portal-color-primary)] focus:outline-none transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={
                  profileSubmitting ||
                  !displayName.trim() ||
                  displayName.trim() === (profile.name ?? '')
                }
                className="w-full rounded-lg bg-[var(--portal-color-primary)] py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                {profileSubmitting ? t('loading') : t('saveProfile')}
              </button>
            </form>
          </div>

          {/* Notification Preference Card (Only displayed if email service is configured) */}
          {profile.isEmailServiceConfigured && (
            <div className="rounded-2xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] p-6 md:p-8 shadow-sm">
              <h2 className="text-lg font-bold text-[var(--portal-color-text)] mb-1">
                {t('notificationSettings')}
              </h2>
              <p className="text-xs text-[var(--portal-color-text-secondary)] leading-relaxed mb-4">
                {t('notificationSettingsDesc')}
              </p>

              {notifError && (
                <div className="rounded-lg bg-red-500/10 p-3 text-xs text-red-500 mb-4">
                  {notifError}
                </div>
              )}

              {notifSuccessMsg && (
                <div className="rounded-lg bg-green-500/10 p-3 text-xs text-green-600 dark:text-green-400 mb-4">
                  {notifSuccessMsg}
                </div>
              )}

              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={receiveNotifications}
                  disabled={notifSubmitting}
                  onChange={(e) => handleNotificationToggle(e.target.checked)}
                  className="h-4 w-4 rounded border-[var(--portal-color-border)] text-[var(--portal-color-primary)] focus:ring-[var(--portal-color-primary)] cursor-pointer"
                />
                <span className="text-xs font-medium text-[var(--portal-color-text)]">
                  {t('receiveNotificationsLabel')}
                </span>
              </label>
            </div>
          )}

          {/* Change/Set Password Card */}
          <div className="rounded-2xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] p-6 md:p-8 shadow-sm">
            <h2 className="text-lg font-bold text-[var(--portal-color-text)] mb-1">
              {profile.hasPassword ? t('changePassword') : t('setPassword')}
            </h2>

            {!profile.hasPassword && (
              <p className="text-xs text-[var(--portal-color-text-secondary)] leading-relaxed mb-4">
                {t('setPasswordDesc')}
              </p>
            )}

            {passwordError && (
              <div className="rounded-lg bg-red-500/10 p-3 text-xs text-red-500 mb-4">
                {passwordError}
              </div>
            )}

            {passwordSuccessMsg && (
              <div className="rounded-lg bg-green-500/10 p-3 text-xs text-green-600 dark:text-green-400 mb-4">
                {passwordSuccessMsg}
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4">
              {profile.hasPassword && (
                <div>
                  <label className="mb-1 block text-xs font-medium text-[var(--portal-color-text-secondary)]">
                    {t('fields.currentPassword')}
                  </label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder={t('placeholders.currentPassword')}
                    className="w-full rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-background)] px-3 py-2 text-sm text-[var(--portal-color-text)] focus:border-[var(--portal-color-primary)] focus:outline-none transition-colors"
                  />
                </div>
              )}

              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--portal-color-text-secondary)]">
                  {t('fields.newPassword')}
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={t('placeholders.newPassword')}
                  className="w-full rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-background)] px-3 py-2 text-sm text-[var(--portal-color-text)] focus:border-[var(--portal-color-primary)] focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--portal-color-text-secondary)]">
                  {t('fields.confirmPassword')}
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t('placeholders.confirmPassword')}
                  className="w-full rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-background)] px-3 py-2 text-sm text-[var(--portal-color-text)] focus:border-[var(--portal-color-primary)] focus:outline-none transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={passwordSubmitting}
                className="w-full rounded-lg bg-[var(--portal-color-primary)] py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                {passwordSubmitting ? t('loading') : t('submit')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
