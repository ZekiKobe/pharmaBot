import { Link } from 'react-router-dom';

export default function PostCard({ post }) {
  const isBuyer = post.type === 'buyer';

  return (
    <Link
      to={`/post/${post._id}`}
      className="mb-3 block rounded-xl border border-gray-200 bg-tg-card p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div>
          <span
            className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
              isBuyer ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
            }`}
          >
            {isBuyer ? 'Buyer Request' : 'Seller Listing'}
          </span>
          <h3 className="mt-2 font-semibold">
            {post.medicineName}
            {post.strength && ` ${post.strength}`}
          </h3>
        </div>
        {!isBuyer && post.price && (
          <strong className="text-emerald-600">ETB {post.price}</strong>
        )}
      </div>
      <div className="mt-2 text-sm text-tg-hint">
        <span>📍 {post.city}</span>
        <span className="ml-3">📦 {post.quantity}</span>
      </div>
      {post.brand && (
        <div className="text-sm text-tg-hint">Brand: {post.brand}</div>
      )}
    </Link>
  );
}
