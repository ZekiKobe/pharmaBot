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
      <Link to="/" className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-500">
        <IconArrowLeft className="h-4 w-4" /> Back
      </Link>

      <div className="app-card">
        <span className={`inline-block rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase ${isBuyer ? 'bg-sky-100 text-sky-700' : 'bg-teal-100 text-teal-700'}`}>
          {isBuyer ? 'Buyer Request' : 'For Sale'}
        </span>
        <h1 className="mt-3 text-xl font-bold text-slate-900">
          {post.medicineName}{post.strength && <span className="text-slate-500"> {post.strength}</span>}
        </h1>

        <div className="mt-5 space-y-3">
          {post.brand && <Row label="Brand" value={post.brand} />}
          <Row label="Quantity" value={post.quantity} />
          {!isBuyer && post.price && <Row label="Price" value={`ETB ${post.price}`} highlight />}
          {!isBuyer && post.expiryDate && <Row label="Expiry" value={new Date(post.expiryDate).toLocaleDateString()} />}
          <div className="flex items-center gap-2 text-sm">
            <IconMapPin className="h-4 w-4 text-teal-600" />
            <span className="font-semibold text-slate-900">{post.city}</span>
          </div>
          {post.description && (
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-[10px] font-bold uppercase text-slate-400">Description</p>
              <p className="mt-1 text-sm text-slate-700">{post.description}</p>
            </div>
          )}
        </div>

        <div className="mt-6 rounded-xl bg-teal-50 p-4">
          <p className="text-[10px] font-bold uppercase text-teal-600">Contact</p>
          {post.telegramUsername && <p className="mt-1 text-sm font-semibold text-teal-700">@{post.telegramUsername.replace('@', '')}</p>}
          <p className="text-sm font-bold text-slate-900">{post.contactPhone}</p>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, highlight }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-slate-400">{label}</span>
      <span className={`font-semibold ${highlight ? 'text-emerald-600' : 'text-slate-900'}`}>{value}</span>
    </div>
  );
}
