import { Link } from 'react-router-dom';
import StatusBadge, { TypeBadge } from './StatusBadge';
import EmptyState from './EmptyState';
import { IconEye, IconCheck, IconX } from './Icons';

export default function PostTable({ posts, showActions = false, onApprove, onReject }) {
  if (!posts.length) {
    return (
      <EmptyState
        title="No posts found"
        description="There are no posts matching your current filters."
      />
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Type</th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Medicine</th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">City</th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Submitted</th>
              <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {posts.map((post) => (
              <tr key={post._id} className="transition-colors hover:bg-slate-50/50">
                <td className="px-5 py-4">
                  <TypeBadge type={post.type} />
                </td>
                <td className="px-5 py-4">
                  <p className="font-medium text-slate-900">
                    {post.medicineName}
                    {post.strength && (
                      <span className="ml-1 font-normal text-slate-500">{post.strength}</span>
                    )}
                  </p>
                  {post.brand && (
                    <p className="mt-0.5 text-xs text-slate-400">{post.brand}</p>
                  )}
                </td>
                <td className="px-5 py-4 text-slate-600">{post.city}</td>
                <td className="px-5 py-4">
                  <StatusBadge status={post.approvalStatus} />
                </td>
                <td className="px-5 py-4 text-slate-500">
                  {new Date(post.createdAt).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-1.5">
                    <Link
                      to={`/posts/${post._id}`}
                      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                      title="View details"
                    >
                      <IconEye />
                      View
                    </Link>
                    {showActions && (
                      <>
                        <button
                          onClick={() => onApprove(post._id)}
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-100"
                        >
                          <IconCheck />
                          Approve
                        </button>
                        <button
                          onClick={() => onReject(post)}
                          className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-100"
                        >
                          <IconX />
                          Reject
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
