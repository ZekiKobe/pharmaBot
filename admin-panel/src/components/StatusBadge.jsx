const statusConfig = {
  draft: { label: 'Draft', className: 'bg-slate-100 text-slate-600' },
  pending: { label: 'Pending', className: 'bg-amber-100 text-amber-800' },
  approved: { label: 'Approved', className: 'bg-emerald-100 text-emerald-800' },
  rejected: { label: 'Rejected', className: 'bg-red-100 text-red-800' },
};

export default function StatusBadge({ status }) {
  const config = statusConfig[status] || statusConfig.draft;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${config.className}`}>
      {config.label}
    </span>
  );
}

export function TypeBadge({ type }) {
  const isBuyer = type === 'buyer';
  return (
    <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold ${isBuyer ? 'bg-sky-100 text-sky-800' : 'bg-teal-100 text-teal-800'}`}>
      {isBuyer ? 'Buyer' : 'Seller'}
    </span>
  );
}

export function ActiveBadge({ isActive }) {
  const active = isActive !== false;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
        active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
      }`}
    >
      {active ? 'Active' : 'Inactive'}
    </span>
  );
}
