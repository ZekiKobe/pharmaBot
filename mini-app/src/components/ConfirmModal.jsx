import { useEffect } from 'react';

export default function ConfirmModal({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
  onConfirm,
  onClose,
}) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const confirmClass =
    variant === 'danger'
      ? 'rounded-xl border border-red-500/40 bg-red-500/15 py-3 text-sm font-semibold text-red-400 disabled:opacity-50'
      : 'btn-app-primary py-3 text-sm';

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center"
      style={{ backgroundColor: 'color-mix(in srgb, var(--tg-theme-text-color, #000) 45%, transparent)' }}
      onClick={onClose}
      role="presentation"
    >
      <div
        className="app-card w-full max-w-sm animate-in shadow-lg"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
      >
        <div
          className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full"
          style={{
            backgroundColor: 'color-mix(in srgb, #ef4444 15%, var(--tg-theme-secondary-bg-color))',
          }}
        >
          <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        </div>

        <h2 id="confirm-modal-title" className="text-center text-lg font-bold text-tg-text">
          {title}
        </h2>
        <p className="mt-2 text-center text-sm leading-relaxed text-tg-hint">{message}</p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button type="button" onClick={onClose} disabled={loading} className="btn-app-secondary py-3 text-sm">
            {cancelLabel}
          </button>
          <button type="button" onClick={onConfirm} disabled={loading} className={confirmClass}>
            {loading ? 'Deleting...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
