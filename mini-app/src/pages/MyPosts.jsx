import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useTelegram } from '../context/TelegramContext';

const statusStyles = {
  draft: 'bg-amber-100 text-amber-700',
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
};

export default function MyPosts() {
  const { telegramId } = useTelegram();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (telegramId) {
      api.getMyPosts(telegramId)
        .then((res) => setPosts(res.data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [telegramId]);

  if (loading) {
    return <div className="p-10 text-center text-tg-hint">Loading...</div>;
  }

  return (
    <div className="mx-auto max-w-xl px-4 pb-20 pt-4">
      <h1 className="mb-4 text-2xl font-bold">📋 My Posts</h1>

      {posts.length === 0 ? (
        <div className="px-5 py-10 text-center text-tg-hint">
          <p>You haven't created any posts yet.</p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <Link
              to="/buyer"
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Request Medicine
            </Link>
            <Link
              to="/seller"
              className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white"
            >
              Sell Medicine
            </Link>
          </div>
        </div>
      ) : (
        posts.map((post) => (
          <div
            key={post._id}
            className="mb-3 rounded-xl border border-gray-200 bg-tg-card p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span
                className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                  post.type === 'buyer' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                {post.type === 'buyer' ? 'Buyer' : 'Seller'}
              </span>
              <span
                className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                  statusStyles[post.approvalStatus]
                }`}
              >
                {post.approvalStatus}
              </span>
            </div>
            <h3 className="mt-2 font-semibold">{post.medicineName}</h3>
            <div className="text-sm text-tg-hint">
              📍 {post.city} · 📦 {post.quantity}
            </div>
            {post.rejectionReason && (
              <p className="mt-2 text-sm text-red-500">Rejected: {post.rejectionReason}</p>
            )}
            {post.approvalStatus === 'draft' && (
              <Link
                to={`/payment/${post._id}`}
                className="mt-3 inline-block rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
              >
                Complete Payment
              </Link>
            )}
          </div>
        ))
      )}
    </div>
  );
}
