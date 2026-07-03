import { useEffect, useState } from 'react';
import { api } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';
import { AlertBanner } from '../components/ConfirmModal';
import { IconCheck, IconX } from '../components/Icons';

const emptyForm = {
  name: '',
  telegramChannelId: '',
  description: '',
  isActive: true,
  isDefault: false,
};

export default function Channels() {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadChannels = () => {
    setLoading(true);
    api
      .getChannels()
      .then((res) => setChannels(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadChannels();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setError('');
  };

  const startEdit = (channel) => {
    setEditingId(channel._id);
    setForm({
      name: channel.name,
      telegramChannelId: channel.telegramChannelId,
      description: channel.description || '',
      isActive: channel.isActive,
      isDefault: channel.isDefault,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      if (editingId) {
        await api.updateChannel(editingId, form);
        setMessage('Channel updated');
      } else {
        await api.createChannel(form);
        setMessage('Channel added');
      }
      resetForm();
      loadChannels();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this channel? Approved posts already published will not be deleted from Telegram.')) {
      return;
    }
    try {
      await api.deleteChannel(id);
      setMessage('Channel removed');
      if (editingId === id) resetForm();
      loadChannels();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="card p-5">
        <h3 className="text-base font-bold text-slate-900">
          {editingId ? 'Edit channel' : 'Add Telegram channel'}
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Approved posts are published to all active channels. The bot must be an admin in each channel.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Channel name
            </label>
            <input
              className="input-field"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Main Marketplace"
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Telegram channel ID
            </label>
            <input
              className="input-field"
              value={form.telegramChannelId}
              onChange={(e) => setForm({ ...form, telegramChannelId: e.target.value })}
              placeholder="@your_channel or -1001234567890"
              required
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Description
            </label>
            <input
              className="input-field"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Optional note for admins"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            />
            Active (publish here on approve)
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
              className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            />
            Default channel
          </label>
          <div className="flex gap-2 sm:col-span-2">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : editingId ? 'Update channel' : 'Add channel'}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="btn-secondary">
                Cancel edit
              </button>
            )}
          </div>
        </form>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>

      {message && <AlertBanner type="success" message={message} onDismiss={() => setMessage('')} />}

      <div className="card overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-4">
          <h3 className="font-bold text-slate-900">Configured channels</h3>
          <p className="text-sm text-slate-500">{channels.length} channel{channels.length !== 1 ? 's' : ''}</p>
        </div>

        {loading ? (
          <LoadingSpinner label="Loading channels..." />
        ) : channels.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-slate-500">
            No channels yet. Add one above, or run <code className="rounded bg-slate-100 px-1.5 py-0.5">npm run seed</code> to import from TELEGRAM_CHANNEL_ID.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {channels.map((channel) => (
              <div key={channel._id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-slate-900">{channel.name}</p>
                    {channel.isDefault && (
                      <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-bold uppercase text-teal-700">
                        Default
                      </span>
                    )}
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                        channel.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {channel.isActive ? <IconCheck className="h-3 w-3" /> : <IconX className="h-3 w-3" />}
                      {channel.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="mt-1 font-mono text-sm text-slate-600">{channel.telegramChannelId}</p>
                  {channel.description && <p className="mt-1 text-sm text-slate-500">{channel.description}</p>}
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => startEdit(channel)} className="btn-secondary py-2 text-xs">
                    Edit
                  </button>
                  <button type="button" onClick={() => handleDelete(channel._id)} className="btn-danger py-2 text-xs">
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
        <p className="font-semibold">Bot admin approval</p>
        <p className="mt-1 text-amber-800">
          Set <code className="rounded bg-white/70 px-1">ADMIN_TELEGRAM_IDS</code> in backend .env so Telegram admins
          get notified when a user submits payment. They can approve or reject from the bot or this admin panel.
        </p>
      </div>
    </div>
  );
}
