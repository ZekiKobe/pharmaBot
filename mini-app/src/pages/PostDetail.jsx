import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import { IconArrowLeft, IconMapPin } from '../components/Icons';

export default function PostDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getPost(id).then((res) => setPost(res.data)).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-200 border-t-teal-600" /></div>;
  }

  if (error || !post) {
    return (
      <div className="app-container text-center">
        <p className="text-red-500">{error || 'Not found'}</p>
        <Link to="/" className="mt-4 inline-block text-sm font-semibold text-teal-600">Back home</Link>
      </div>
    );
  }

  const isBuyer = post.type === 'buyer';

  return (
    <div className="app-container">
      <Link to="/" className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-tg-hint">
        <IconArrowLeft className="h-4 w-4" /> Back
      </Link>

      <div className="app-card">
        <span
          className="inline-block rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase"
          style={{
            backgroundColor: isBuyer
              ? 'color-mix(in srgb, #38bdf8 18%, var(--tg-theme-secondary-bg-color))'
              : 'color-mix(in srgb, var(--tg-theme-button-color) 18%, var(--tg-theme-secondary-bg-color))',
            color: isBuyer ? '#38bdf8' : 'var(--tg-theme-link-color)',
          }}
        >
          {isBuyer ? 'Buyer Request' : 'For Sale'}
        </span>
        <h1 className="mt-3 text-xl font-bold text-tg-text">
          {post.medicineName}{post.strength && <span className="text-tg-hint"> {post.strength}</span>}
        </h1>

        <div className="mt-5 space-y-3">
          {post.brand && <Row label="Brand" value={post.brand} />}
          <Row label="Quantity" value={post.quantity} />
          {!isBuyer && post.price && <Row label="Price" value={`ETB ${post.price}`} highlight />}
          {!isBuyer && post.expiryDate && <Row label="Expiry" value={new Date(post.expiryDate).toLocaleDateString()} />}
          <div className="flex items-center gap-2 text-sm">
            <IconMapPin className="h-4 w-4 text-tg-link" />
            <span className="font-semibold text-tg-text">{post.city}</span>
          </div>
          {post.description && (
            <div
              className="rounded-xl p-3"
              style={{ backgroundColor: 'color-mix(in srgb, var(--tg-theme-hint-color) 10%, var(--tg-theme-secondary-bg-color))' }}
            >
              <p className="text-[10px] font-bold uppercase text-tg-hint">Description</p>
              <p className="mt-1 text-sm text-tg-text">{post.description}</p>
            </div>
          )}
          {post.medicineImage && (
            <div
              className="rounded-xl p-3"
              style={{ backgroundColor: 'color-mix(in srgb, var(--tg-theme-hint-color) 10%, var(--tg-theme-secondary-bg-color))' }}
            >
              <p className="text-[10px] font-bold uppercase text-tg-hint">Photo</p>
              <img
                src={api.getUploadUrl(post.medicineImage)}
                alt="Medicine"
                className="mt-2 max-h-56 w-full rounded-lg object-contain"
              />
            </div>
          )}
        </div>

        <div
          className="mt-6 rounded-xl p-4"
          style={{ backgroundColor: 'color-mix(in srgb, var(--tg-theme-button-color) 12%, var(--tg-theme-secondary-bg-color))' }}
        >
          <p className="text-[10px] font-bold uppercase text-tg-link">Contact</p>
          {post.telegramUsername && <p className="mt-1 text-sm font-semibold text-tg-link">@{post.telegramUsername.replace('@', '')}</p>}
          <p className="text-sm font-bold text-tg-text">{post.contactPhone}</p>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, highlight }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-tg-hint">{label}</span>
      <span className={`font-semibold ${highlight ? 'text-emerald-400' : 'text-tg-text'}`}>{value}</span>
    </div>
  );
}
