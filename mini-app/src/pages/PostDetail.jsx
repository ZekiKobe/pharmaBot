import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import { useLanguage } from '../context/LanguageContext';
import { IconArrowLeft, IconMapPin } from '../components/Icons';
import ContactSection from '../components/ContactSection';

export default function PostDetail() {
  const { id } = useParams();
  const { t, tCategory } = useLanguage();
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
        <p className="text-red-500">{error || t('postDetail.notFound')}</p>
        <Link to="/" className="mt-4 inline-block text-sm font-semibold text-teal-600">{t('postDetail.backHome')}</Link>
      </div>
    );
  }

  const isBuyer = post.type === 'buyer';

  return (
    <div className="app-container">
      <Link to="/" className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-tg-hint">
        <IconArrowLeft className="h-4 w-4" /> {t('postDetail.back')}
      </Link>

      <div className="app-card">
        {post.medicineImage && (
          <div
            className="mb-4 rounded-xl p-3"
            style={{ backgroundColor: 'color-mix(in srgb, var(--tg-theme-hint-color) 10%, var(--tg-theme-secondary-bg-color))' }}
          >
            <p className="text-[10px] font-bold uppercase text-tg-hint">{t('postDetail.photo')}</p>
            <img
              src={api.getUploadUrl(post.medicineImage)}
              alt="Medicine"
              className="mt-2 max-h-56 w-full rounded-lg object-contain"
            />
          </div>
        )}
        <span
          className="inline-block rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase"
          style={{
            backgroundColor: isBuyer
              ? 'color-mix(in srgb, #38bdf8 18%, var(--tg-theme-secondary-bg-color))'
              : 'color-mix(in srgb, var(--tg-theme-button-color) 18%, var(--tg-theme-secondary-bg-color))',
            color: isBuyer ? '#38bdf8' : 'var(--tg-theme-link-color)',
          }}
        >
          {isBuyer ? t('postDetail.wantToBuy') : t('postDetail.forSale')}
        </span>
        <h1 className="mt-3 text-xl font-bold text-tg-text">
          {post.medicineName}{post.strength && <span className="text-tg-hint"> {post.strength}</span>}
        </h1>

        <div className="mt-5 space-y-3">
          {post.brand && <Row label={t('postDetail.brand')} value={post.brand} />}
          {!isBuyer && post.category && <Row label={t('postDetail.category')} value={tCategory(post.category)} />}
          <Row label={t('postDetail.quantity')} value={post.quantity} />
          {!isBuyer && post.price && <Row label={t('postDetail.price')} value={`ETB ${post.price}`} highlight />}
          {!isBuyer && post.expiryDate && <Row label={t('postDetail.expiry')} value={new Date(post.expiryDate).toLocaleDateString()} />}
          <div className="flex items-center gap-2 text-sm">
            <IconMapPin className="h-4 w-4 text-tg-link" />
            <span className="font-semibold text-tg-text">{post.city}</span>
          </div>
          {post.description && (
            <div
              className="rounded-xl p-3"
              style={{ backgroundColor: 'color-mix(in srgb, var(--tg-theme-hint-color) 10%, var(--tg-theme-secondary-bg-color))' }}
            >
              <p className="text-sm text-tg-text">{post.description}</p>
            </div>
          )}
        </div>

        <ContactSection telegramUsername={post.telegramUsername} contactPhone={post.contactPhone} />
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
