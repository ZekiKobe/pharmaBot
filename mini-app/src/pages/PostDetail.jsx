import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';

export default function PostDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getPost(id)
      .then((res) => setPost(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="p-10 text-center text-tg-hint">Loading...</div>;
  }

  if (error || !post) {
    return (
      <div className="mx-auto max-w-xl px-4 pb-20 pt-10 text-center">
        <p className="mb-4 text-red-500">{error || 'Post not found'}</p>
        <Link to="/" className="text-blue-600 underline">Back to Home</Link>
      </div>
    );
  }

  const isBuyer = post.type === 'buyer';

  return (
    <div className="mx-auto max-w-xl px-4 pb-20 pt-4">
      <Link to="/" className="mb-4 inline-block text-sm text-blue-600">← Back</Link>

      <div className="rounded-xl border border-gray-200 bg-tg-card p-5 shadow-sm">
        <span
          className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
            isBuyer ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
          }`}
        >
          {isBuyer ? 'Buyer Request' : 'Seller Listing'}
        </span>

        <h1 className="mt-3 text-2xl font-bold">
          {post.medicineName}
          {post.strength && ` ${post.strength}`}
        </h1>

        <div className="mt-4 space-y-3">
          {post.brand && (
            <div>
              <span className="text-sm text-tg-hint">Brand</span>
              <p className="font-medium">{post.brand}</p>
            </div>
          )}
          <div>
            <span className="text-sm text-tg-hint">Quantity</span>
            <p className="font-medium">{post.quantity}</p>
          </div>
          {!isBuyer && post.price && (
            <div>
              <span className="text-sm text-tg-hint">Price</span>
              <p className="text-lg font-semibold text-emerald-600">ETB {post.price}</p>
            </div>
          )}
          {!isBuyer && post.expiryDate && (
            <div>
              <span className="text-sm text-tg-hint">Expiry Date</span>
              <p className="font-medium">{new Date(post.expiryDate).toLocaleDateString()}</p>
            </div>
          )}
          <div>
            <span className="text-sm text-tg-hint">City</span>
            <p className="font-medium">📍 {post.city}</p>
          </div>
          {post.description && (
            <div>
              <span className="text-sm text-tg-hint">Description</span>
              <p className="font-medium">{post.description}</p>
            </div>
          )}
        </div>

        <div className="mt-6 rounded-xl bg-gray-50 p-4">
          <h3 className="mb-2 font-semibold">Contact</h3>
          {post.telegramUsername && (
            <p className="text-blue-600">@{post.telegramUsername.replace('@', '')}</p>
          )}
          <p className="font-medium">{post.contactPhone}</p>
        </div>
      </div>
    </div>
  );
}
