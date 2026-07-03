import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IconPill } from '../components/Icons';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Login() {
  const { login, isAuthenticated, loading } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  if (loading) return <LoadingSpinner label="Checking session..." />;
  if (isAuthenticated) return <Navigate to="/" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setSubmitting(true);
    try {
      await login(username, password);
    } catch (err) {
      setError(err.message);
      setFieldErrors(err.fieldErrors || {});
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-1/2 overflow-hidden bg-slate-900 lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-teal-600/30 via-transparent to-transparent" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-teal-500/10 blur-3xl" />

        <div className="relative z-10 p-12">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-600 text-white">
              <IconPill />
            </div>
            <span className="text-xl font-bold text-white">PharmaBot</span>
          </div>
        </div>

        <div className="relative z-10 px-12 pb-16">
          <h2 className="text-4xl font-extrabold leading-tight tracking-tight text-white">
            Manage your<br />pharmacy marketplace
          </h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-slate-400">
            Review posts, verify payments, publish to Telegram, and track revenue from one dashboard.
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center bg-slate-50 px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white">
                <IconPill className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold text-slate-900">PharmaBot</span>
            </div>
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Sign in</h1>
          <p className="mt-1 text-sm text-slate-500">Enter your admin credentials</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Username</label>
              <input type="text" value={username} onChange={(e) => { setUsername(e.target.value); setFieldErrors((p) => { const n = { ...p }; delete n.username; return n; }); }} required autoComplete="username" className={`input-field ${fieldErrors.username ? 'border-red-400 ring-2 ring-red-100' : ''}`} placeholder="admin" />
              {fieldErrors.username && <p className="mt-1 text-xs text-red-600">{fieldErrors.username}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Password</label>
              <input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setFieldErrors((p) => { const n = { ...p }; delete n.password; return n; }); }} required autoComplete="current-password" className={`input-field ${fieldErrors.password ? 'border-red-400 ring-2 ring-red-100' : ''}`} placeholder="••••••••" />
              {fieldErrors.password && <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>}
            </div>
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>
            )}
            <button type="submit" disabled={submitting} className="btn-primary w-full py-3">
              {submitting ? 'Signing in...' : 'Sign in to dashboard'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
