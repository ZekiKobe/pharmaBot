import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useTelegram } from '../context/TelegramContext';

const statusStyle = {
  draft: 'bg-tg-hint/15 text-tg-hint',
  pending: 'bg-amber-500/15 text-amber-400',
  approved: 'bg-emerald-500/15 text-emerald-400',
  rejected: 'bg-red-500/15 text-red-400',
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
      <h1 className="text-xl font-bold text-tg-text">My Posts</h1>
      <p className="mt-1 text-sm text-tg-hint">Track your submissions</p>

      {posts.length === 0 ? (
        <div className="app-card mt-6 py-10 text-center">
          <p className="text-sm text-tg-hint">No posts yet</p>
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
                <span
                  className="rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase"
                  style={{
                    backgroundColor: post.type === 'buyer'
                      ? 'color-mix(in srgb, #38bdf8 18%, var(--tg-theme-secondary-bg-color))'
                      : 'color-mix(in srgb, var(--tg-theme-button-color) 18%, var(--tg-theme-secondary-bg-color))',
                    color: post.type === 'buyer' ? '#38bdf8' : 'var(--tg-theme-link-color)',
                  }}
                >
                  {post.type}
                </span>
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold capitalize ${statusStyle[post.approvalStatus]}`}>
                  {post.approvalStatus}
                </span>
              </div>
              <h3 className="mt-2 font-bold text-tg-text">{post.medicineName}</h3>
              <p className="mt-1 text-xs text-tg-hint">{post.city} · {post.quantity}</p>
              {post.rejectionReason && <p className="mt-2 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">{post.rejectionReason}</p>}
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
