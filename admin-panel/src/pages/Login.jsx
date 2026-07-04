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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-100 px-4 py-10 sm:px-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(13,148,136,0.10),_transparent_42%)]" />
      <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-500/10 blur-3xl" />

      <div className="relative z-10 w-full max-w-md">
        <div className="card border-slate-200/90 p-6 shadow-xl shadow-slate-200/70 sm:p-8">
          <div className="mb-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-lg shadow-teal-600/25">
              <IconPill className="h-7 w-7" />
            </div>
            <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-slate-900">PharmaBot Admin</h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Sign in to manage posts, users, channels, and marketplace settings.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Username</label>
              <input type="text" value={username} onChange={(e) => { setUsername(e.target.value); setFieldErrors((p) => { const n = { ...p }; delete n.username; return n; }); }} required autoComplete="username" className={`input-field ${fieldErrors.username ? 'border-red-400 ring-2 ring-red-100' : ''}`} placeholder="admin" />
              {fieldErrors.username && <p className="mt-1 text-xs text-red-600">{fieldErrors.username}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Password</label>
              <input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setFieldErrors((p) => { const n = { ...p }; delete n.password; return n; }); }} required autoComplete="current-password" className={`input-field ${fieldErrors.password ? 'border-red-400 ring-2 ring-red-100' : ''}`} placeholder="Enter your password" />
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
