import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useTelegram } from '../context/TelegramContext';

const statusStyle = {
  draft: 'bg-slate-100 text-slate-600',
  pending: 'bg-amber-100 text-amber-800',
  approved: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-red-100 text-red-800',
};

export default function MyPosts() {
  const { telegramId } = useTelegram();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (telegramId) {
      api.getMyPosts(telegramId).then((res) => setPosts(res.data)).catch(console.error).finally(() => setLoading(false));
    }
  }, [telegramId]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-200 border-t-teal-600" />
      </div>
    );
  }

  return (
    <div className="app-container">
      <h1 className="text-xl font-bold text-slate-900">My Posts</h1>
      <p className="mt-1 text-sm text-slate-500">Track your submissions</p>

      {posts.length === 0 ? (
        <div className="app-card mt-6 py-10 text-center">
          <p className="text-sm text-slate-500">No posts yet</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Link to="/buyer" className="btn-app-primary py-2.5 text-xs">Request</Link>
            <Link to="/seller" className="btn-app-secondary py-2.5 text-xs">Sell</Link>
          </div>
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {posts.map((post) => (
            <div key={post._id} className="app-card">
              <div className="flex items-center justify-between">
                <span className={`rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase ${post.type === 'buyer' ? 'bg-sky-100 text-sky-700' : 'bg-teal-100 text-teal-700'}`}>
                  {post.type}
                </span>
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold capitalize ${statusStyle[post.approvalStatus]}`}>
                  {post.approvalStatus}
                </span>
              </div>
              <h3 className="mt-2 font-bold text-slate-900">{post.medicineName}</h3>
              <p className="mt-1 text-xs text-slate-500">{post.city} · {post.quantity}</p>
              {post.rejectionReason && <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{post.rejectionReason}</p>}
              {post.approvalStatus === 'draft' && (
                <Link to={`/payment/${post._id}`} className="btn-app-primary mt-3 py-2.5 text-xs">Complete Payment</Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
