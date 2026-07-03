const statusConfig = {
  draft: { label: 'Draft', className: 'bg-slate-100 text-slate-600 ring-slate-500/10' },
  pending: { label: 'Pending', className: 'bg-amber-50 text-amber-700 ring-amber-600/10' },
  approved: { label: 'Approved', className: 'bg-emerald-50 text-emerald-700 ring-emerald-600/10' },
  rejected: { label: 'Rejected', className: 'bg-red-50 text-red-700 ring-red-600/10' },
};

export default function StatusBadge({ status }) {
  const config = statusConfig[status] || statusConfig.draft;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${config.className}`}
    >
      <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
        status === 'approved' ? 'bg-emerald-500' :
        status === 'pending' ? 'bg-amber-500' :
        status === 'rejected' ? 'bg-red-500' : 'bg-slate-400'
      }`} />
      {config.label}
    </span>
  );
}

export function TypeBadge({ type }) {
  const isBuyer = type === 'buyer';
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
        isBuyer
          ? 'bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-600/10'
          : 'bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-600/10'
      }`}
    >
      {isBuyer ? 'Buyer' : 'Seller'}
    </span>
  );
}
