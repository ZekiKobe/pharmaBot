import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { IconCheck, IconX } from './Icons';

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'success') => {
    const id = ++toastId;
    setToasts((current) => [...current, { id, message, type }]);
    window.setTimeout(() => dismiss(id), 4000);
    return id;
  }, [dismiss]);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-6 right-6 z-[200] flex w-full max-w-sm flex-col gap-2 px-4 sm:px-0">
        {toasts.map((toast) => {
          const styles =
            toast.type === 'error'
              ? 'border-red-200 bg-red-50 text-red-900'
              : toast.type === 'warning'
                ? 'border-amber-200 bg-amber-50 text-amber-900'
                : 'border-emerald-200 bg-emerald-50 text-emerald-900';

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-lg ${styles}`}
            >
              {toast.type === 'error' ? (
                <IconX className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
              ) : (
                <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              )}
              <p className="flex-1 font-medium leading-relaxed">{toast.message}</p>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                className="rounded p-1 opacity-60 transition-opacity hover:opacity-100"
              >
                <IconX className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
