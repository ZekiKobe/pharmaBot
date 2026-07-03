import { Link } from 'react-router-dom';
import StatusBadge, { TypeBadge, ActiveBadge } from './StatusBadge';
import EmptyState from './EmptyState';
import { IconEye, IconCheck, IconX } from './Icons';

export default function PostTable({ posts, showActions = false, onApprove, onReject }) {
  if (!posts.length) {
    return <EmptyState title="No posts found" description="No posts match your current filters." />;
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80">
              {['Type', 'Medicine', 'City', 'Status', 'Visibility', 'Submitted', 'Actions'].map((h) => (
                <th key={h} className={`px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 ${h === 'Actions' ? 'text-right' : ''}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {posts.map((post) => (
              <tr key={post._id} className="transition-colors hover:bg-slate-50/80">
                <td className="px-5 py-4"><TypeBadge type={post.type} /></td>
                <td className="px-5 py-4">
                  <p className="font-semibold text-slate-900">{post.medicineName}{post.strength && <span className="font-normal text-slate-400"> {post.strength}</span>}</p>
                  {post.brand && <p className="text-xs text-slate-400">{post.brand}</p>}
                </td>
                <td className="px-5 py-4 text-slate-600">{post.city}</td>
                <td className="px-5 py-4"><StatusBadge status={post.approvalStatus} /></td>
                <td className="px-5 py-4">
                  {post.approvalStatus === 'approved' ? (
                    <ActiveBadge isActive={post.isActive} />
                  ) : (
                    <span className="text-xs text-slate-400">—</span>
                  )}
                </td>
                <td className="px-5 py-4 text-slate-400">{new Date(post.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-1.5">
                    <Link to={`/posts/${post._id}`} className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100">
                      <IconEye /> View
                    </Link>
                    {showActions && (
                      <>
                        <button onClick={() => onApprove(post._id)} className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100">
                          <IconCheck /> Approve
                        </button>
                        <button onClick={() => onReject(post)} className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100">
                          <IconX /> Reject
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
