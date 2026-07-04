import { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import PageHeader from '../components/PageHeader';
import ConfirmModal from '../components/ConfirmModal';
import { useToast } from '../components/Toast';
import { IconTrash, IconUsers } from '../components/Icons';

function FieldError({ message }) {
  if (!message) return null;
  return <p className="mt-1 text-xs font-medium text-red-600">{message}</p>;
}

export default function Users() {
  const { admin } = useAuth();
  const { showToast } = useToast();
  const isSuperadmin = admin?.role === 'superadmin';
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [botUsers, setBotUsers] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminForm, setAdminForm] = useState({ username: '', password: '', role: 'admin' });
  const [adminFormErrors, setAdminFormErrors] = useState({});
  const [savingAdmin, setSavingAdmin] = useState(false);
  const [deleteBotUserId, setDeleteBotUserId] = useState(null);
  const [deleteAdminId, setDeleteAdminId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadData = async (query = '') => {
    setLoading(true);
    try {
      const requests = [api.getBotUsers(query), api.getAdminUsers()];
      const [usersRes, adminsRes] = await Promise.all(requests);
      setBotUsers(usersRes.data || []);
      setAdminUsers(adminsRes.data || []);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData(search.trim());
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setSavingAdmin(true);
    setAdminFormErrors({});

    try {
      await api.createAdminUser(adminForm);
      setAdminForm({ username: '', password: '', role: 'admin' });
      showToast('Admin user created');
      loadData(search.trim());
    } catch (err) {
      setAdminFormErrors(err.fieldErrors || {});
      showToast(err.message, 'error');
    } finally {
      setSavingAdmin(false);
    }
  };

  const selectedBotUser = botUsers.find((user) => user._id === deleteBotUserId);
  const selectedAdminUser = adminUsers.find((item) => item._id === deleteAdminId);

  const handleDeleteBotUser = async () => {
    if (!deleteBotUserId) return;
    setDeleteLoading(true);
    try {
      await api.deleteBotUser(deleteBotUserId);
      showToast('Bot user removed');
      setDeleteBotUserId(null);
      loadData(search.trim());
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteAdmin = async () => {
    if (!deleteAdminId) return;
    setDeleteLoading(true);
    try {
      await api.deleteAdminUser(deleteAdminId);
      showToast('Admin user removed');
      setDeleteAdminId(null);
      loadData(search.trim());
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) return <LoadingSpinner label="Loading users..." />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Manage admin accounts and review everyone who has joined through the Telegram bot."
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <section className="space-y-6">
          <div className="card p-5 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-600">Bot Users</p>
                <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-900">Users joined via Telegram</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Search by username, full name, phone, or Telegram ID.
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-500">
                {botUsers.length} users
              </div>
            </div>

            <form onSubmit={handleSearchSubmit} className="mt-5 flex flex-col gap-3 sm:flex-row">
              <input
                className="input-field"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search users..."
              />
              <button type="submit" className="btn-primary shrink-0">
                Search
              </button>
            </form>

            <div className="mt-5 space-y-3">
              {botUsers.map((user) => (
                <div key={user._id} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-100 text-teal-700">
                          <IconUsers className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-900">{user.fullName || 'Unnamed user'}</p>
                          <p className="truncate text-sm text-slate-500">
                            {user.username ? `@${user.username}` : 'No Telegram username'}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                        <InfoItem label="Telegram ID" value={user.telegramId} mono />
                        <InfoItem label="Phone" value={user.phoneNumber || '—'} />
                        <InfoItem label="Joined" value={new Date(user.createdAt).toLocaleDateString()} />
                        <InfoItem label="Posts" value={`${user.totalPosts} total / ${user.approvedPosts} approved`} />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setDeleteBotUserId(user._id)}
                      className="btn-danger self-start py-2 text-xs"
                    >
                      <IconTrash />
                      Remove
                    </button>
                  </div>
                </div>
              ))}

              {botUsers.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-200 px-5 py-10 text-center text-sm text-slate-500">
                  No users matched your search.
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="card p-5 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">Admin Accounts</p>
            <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-900">Dashboard access</h2>
            <p className="mt-1 text-sm text-slate-500">
              Create and review admin users who can sign in to the panel.
            </p>

            {isSuperadmin ? (
              <form onSubmit={handleCreateAdmin} className="mt-5 space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">Username</label>
                  <input
                    className={`input-field ${adminFormErrors.username ? 'border-red-400 ring-2 ring-red-100' : ''}`}
                    value={adminForm.username}
                    onChange={(e) => setAdminForm((prev) => ({ ...prev, username: e.target.value }))}
                    placeholder="newadmin"
                  />
                  <FieldError message={adminFormErrors.username} />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">Password</label>
                  <input
                    type="password"
                    className={`input-field ${adminFormErrors.password ? 'border-red-400 ring-2 ring-red-100' : ''}`}
                    value={adminForm.password}
                    onChange={(e) => setAdminForm((prev) => ({ ...prev, password: e.target.value }))}
                    placeholder="At least 6 characters"
                  />
                  <FieldError message={adminFormErrors.password} />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">Role</label>
                  <select
                    className="input-field"
                    value={adminForm.role}
                    onChange={(e) => setAdminForm((prev) => ({ ...prev, role: e.target.value }))}
                  >
                    <option value="admin">Admin</option>
                    <option value="superadmin">Superadmin</option>
                  </select>
                </div>
                <button type="submit" className="btn-primary w-full" disabled={savingAdmin}>
                  {savingAdmin ? 'Creating...' : 'Create admin user'}
                </button>
              </form>
            ) : (
              <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                Only superadmins can create or remove admin accounts.
              </div>
            )}
          </div>

          <div className="card p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Existing admins</h3>
                <p className="text-sm text-slate-500">{adminUsers.length} account{adminUsers.length !== 1 ? 's' : ''}</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {adminUsers.map((item) => (
                <div key={item._id} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">{item.username}</p>
                      <p className="text-sm capitalize text-slate-500">{item.role}</p>
                    </div>
                    {isSuperadmin && item._id !== admin?.id && (
                      <button
                        type="button"
                        onClick={() => setDeleteAdminId(item._id)}
                        className="btn-danger py-2 text-xs"
                      >
                        <IconTrash />
                        Remove
                      </button>
                    )}
                  </div>
                  <p className="mt-3 text-xs text-slate-400">
                    Created {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {selectedBotUser && (
        <ConfirmModal
          title="Remove bot user?"
          message={`Remove ${selectedBotUser.fullName || selectedBotUser.username || selectedBotUser.telegramId} from the user list? This works only if the user has no posts.`}
          confirmLabel="Remove"
          variant="danger"
          loading={deleteLoading}
          onConfirm={handleDeleteBotUser}
          onClose={() => !deleteLoading && setDeleteBotUserId(null)}
        />
      )}

      {selectedAdminUser && (
        <ConfirmModal
          title="Remove admin user?"
          message={`Remove ${selectedAdminUser.username} from dashboard access?`}
          confirmLabel="Remove"
          variant="danger"
          loading={deleteLoading}
          onConfirm={handleDeleteAdmin}
          onClose={() => !deleteLoading && setDeleteAdminId(null)}
        />
      )}
    </div>
  );
}

function InfoItem({ label, value, mono = false }) {
  return (
    <div className="rounded-xl bg-white px-3 py-2.5">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`mt-1 text-sm font-medium text-slate-800 ${mono ? 'break-all font-mono text-xs sm:text-sm' : ''}`}>
        {value}
      </p>
    </div>
  );
}
