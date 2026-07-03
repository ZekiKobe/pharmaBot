import { IconCheck, IconX } from './Icons';

export default function ConfirmModal({ title, message, confirmLabel = 'Confirm', variant = 'primary', onConfirm, onClose, loading }) {
  const confirmClass = variant === 'danger' ? 'btn-danger' : variant === 'success' ? 'btn-success' : 'btn-primary';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md animate-in rounded-2xl bg-white p-6 shadow-elevated">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">{message}</p>
        <div className="mt-6 flex gap-3">
          <button type="button" onClick={onClose} className="btn-secondary flex-1" disabled={loading}>
            Cancel
          </button>
          <button type="button" onClick={onConfirm} className={`${confirmClass} flex-1`} disabled={loading}>
            {loading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function AlertBanner({ type = 'success', message, onDismiss }) {
  const styles = {
    success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    error: 'border-red-200 bg-red-50 text-red-800',
    warning: 'border-amber-200 bg-amber-50 text-amber-800',
  };

  const icons = {
    success: <IconCheck className="h-4 w-4 text-emerald-600" />,
    error: <IconX className="h-4 w-4 text-red-600" />,
    warning: <IconClock className="h-4 w-4 text-amber-600" />,
  };

  return (
    <div className={`mb-6 flex items-center justify-between rounded-lg border px-4 py-3 text-sm ${styles[type]}`}>
      <div className="flex items-center gap-2">
        {icons[type]}
        <span className="font-medium">{message}</span>
      </div>
      {onDismiss && (
        <button onClick={onDismiss} className="rounded p-1 opacity-60 hover:opacity-100">
          <IconX className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

function IconClock({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
