import { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import PageHeader from '../components/PageHeader';
import { useToast } from '../components/Toast';

const emptyPasswordForm = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

const emptySettingsForm = {
  botDisplayName: '',
  botUsername: '',
  cbeAccountNumber: '',
  telebirrPhone: '',
};

function FieldError({ message }) {
  if (!message) return null;
  return <p className="mt-1 text-xs font-medium text-red-600">{message}</p>;
}

export default function Settings() {
  const { admin } = useAuth();
  const { showToast } = useToast();
  const isSuperadmin = admin?.role === 'superadmin';
  const [loading, setLoading] = useState(true);
  const [passwordForm, setPasswordForm] = useState(emptyPasswordForm);
  const [settingsForm, setSettingsForm] = useState(emptySettingsForm);
  const [passwordErrors, setPasswordErrors] = useState({});
  const [settingsErrors, setSettingsErrors] = useState({});
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);

  useEffect(() => {
    api
      .getSettings()
      .then((res) => {
        setSettingsForm({
          botDisplayName: res.data.botDisplayName || '',
          botUsername: res.data.botUsername || '',
          cbeAccountNumber: res.data.cbeAccountNumber || '',
          telebirrPhone: res.data.telebirrPhone || '',
        });
      })
      .catch((err) => showToast(err.message, 'error'))
      .finally(() => setLoading(false));
  }, [showToast]);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordSaving(true);
    setPasswordErrors({});

    try {
      await api.changePassword(passwordForm);
      setPasswordForm(emptyPasswordForm);
      showToast('Password changed successfully');
    } catch (err) {
      setPasswordErrors(err.fieldErrors || {});
      showToast(err.message, 'error');
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleSettingsSave = async (e) => {
    e.preventDefault();
    setSettingsSaving(true);
    setSettingsErrors({});

    try {
      const res = await api.updateSettings(settingsForm);
      setSettingsForm({
        botDisplayName: res.data.botDisplayName || '',
        botUsername: res.data.botUsername || '',
        cbeAccountNumber: res.data.cbeAccountNumber || '',
        telebirrPhone: res.data.telebirrPhone || '',
      });
      showToast('Global settings updated');
    } catch (err) {
      setSettingsErrors(err.fieldErrors || {});
      showToast(err.message, 'error');
    } finally {
      setSettingsSaving(false);
    }
  };

  if (loading) return <LoadingSpinner label="Loading settings..." />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your account security and the business details shown across the bot, payment instructions, and admin tools."
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.9fr)]">
        <section className="card overflow-hidden">
          <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-600">Bot Details</p>
            <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-900">Global business settings</h2>
            <p className="mt-1 text-sm text-slate-500">
              These values are used in payment instructions and Telegram bot/channel presentation.
            </p>
          </div>

          <form onSubmit={handleSettingsSave} className="space-y-5 px-5 py-5 sm:px-6">
            {!isSuperadmin && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                Only superadmins can update global bot and payment settings. You can still view the current configuration below.
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Bot display name</label>
                <input
                  className={`input-field ${settingsErrors.botDisplayName ? 'border-red-400 ring-2 ring-red-100' : ''}`}
                  value={settingsForm.botDisplayName}
                  onChange={(e) => setSettingsForm((prev) => ({ ...prev, botDisplayName: e.target.value }))}
                  placeholder="PharmaBot"
                  disabled={!isSuperadmin}
                />
                <FieldError message={settingsErrors.botDisplayName} />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Bot username</label>
                <input
                  className={`input-field ${settingsErrors.botUsername ? 'border-red-400 ring-2 ring-red-100' : ''}`}
                  value={settingsForm.botUsername}
                  onChange={(e) => setSettingsForm((prev) => ({ ...prev, botUsername: e.target.value }))}
                  placeholder="@ethiopharmamarketbot"
                  disabled={!isSuperadmin}
                />
                <FieldError message={settingsErrors.botUsername} />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">CBE account number</label>
                <input
                  className={`input-field ${settingsErrors.cbeAccountNumber ? 'border-red-400 ring-2 ring-red-100' : ''}`}
                  value={settingsForm.cbeAccountNumber}
                  onChange={(e) => setSettingsForm((prev) => ({ ...prev, cbeAccountNumber: e.target.value }))}
                  placeholder="1000262694392"
                  disabled={!isSuperadmin}
                />
                <FieldError message={settingsErrors.cbeAccountNumber} />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Telebirr phone</label>
                <input
                  className={`input-field ${settingsErrors.telebirrPhone ? 'border-red-400 ring-2 ring-red-100' : ''}`}
                  value={settingsForm.telebirrPhone}
                  onChange={(e) => setSettingsForm((prev) => ({ ...prev, telebirrPhone: e.target.value }))}
                  placeholder="0993676861"
                  disabled={!isSuperadmin}
                />
                <FieldError message={settingsErrors.telebirrPhone} />
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Changes appear in new payment info responses and newly published Telegram messages.
              </p>
              {isSuperadmin && (
                <button type="submit" className="btn-primary" disabled={settingsSaving}>
                  {settingsSaving ? 'Saving...' : 'Save global settings'}
                </button>
              )}
            </div>
          </form>
        </section>

        <div className="space-y-6">
          <section className="card overflow-hidden">
            <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">Account Security</p>
              <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-900">Change your password</h2>
              <p className="mt-1 text-sm text-slate-500">
                Update your admin password without affecting other administrators.
              </p>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4 px-5 py-5 sm:px-6">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Current password</label>
                <input
                  type="password"
                  autoComplete="current-password"
                  className={`input-field ${passwordErrors.currentPassword ? 'border-red-400 ring-2 ring-red-100' : ''}`}
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                  placeholder="Enter your current password"
                />
                <FieldError message={passwordErrors.currentPassword} />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">New password</label>
                <input
                  type="password"
                  autoComplete="new-password"
                  className={`input-field ${passwordErrors.newPassword ? 'border-red-400 ring-2 ring-red-100' : ''}`}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                  placeholder="At least 6 characters"
                />
                <FieldError message={passwordErrors.newPassword} />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Confirm new password</label>
                <input
                  type="password"
                  autoComplete="new-password"
                  className={`input-field ${passwordErrors.confirmPassword ? 'border-red-400 ring-2 ring-red-100' : ''}`}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Re-enter the new password"
                />
                <FieldError message={passwordErrors.confirmPassword} />
              </div>

              <button type="submit" className="btn-primary w-full sm:w-auto" disabled={passwordSaving}>
                {passwordSaving ? 'Updating...' : 'Update password'}
              </button>
            </form>
          </section>

          <section className="card overflow-hidden">
            <div className="px-5 py-5 sm:px-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Current Admin</p>
              <div className="mt-4 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-100 text-base font-bold text-teal-700">
                  {(admin?.username || '?').charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-lg font-bold text-slate-900">{admin?.username}</p>
                  <p className="text-sm capitalize text-slate-500">{admin?.role}</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
