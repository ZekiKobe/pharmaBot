import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useLanguage } from '../context/LanguageContext';
import { IconMapPin, IconPill } from './Icons';

export default function PostCard({ post }) {
  const { t } = useLanguage();
  const isBuyer = post.type === 'buyer';
  const [imageFailed, setImageFailed] = useState(false);
  const imageUrl = post.medicineImage && !imageFailed ? api.getUploadUrl(post.medicineImage) : null;

  return (
    <Link
      to={`/post/${post._id}`}
      className="app-card block h-full transition-transform active:scale-[0.99]"
    >
      <div
        className="relative aspect-[4/3] overflow-hidden rounded-xl"
        style={{
          backgroundColor: 'color-mix(in srgb, var(--tg-theme-button-color, #0d9488) 10%, var(--tg-theme-secondary-bg-color))',
        }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={post.medicineName}
            className="h-full w-full object-cover"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-full"
              style={{
                backgroundColor:
                  'color-mix(in srgb, var(--tg-theme-button-color, #0d9488) 18%, var(--tg-theme-secondary-bg-color))',
                color: 'var(--tg-theme-button-color, #0d9488)',
              }}
            >
              <IconPill className="h-7 w-7" />
            </div>
          </div>
        )}
        {!isBuyer && post.price && (
          <div
            className="absolute right-2 top-2 rounded-xl px-2.5 py-1 text-right"
            style={{ backgroundColor: 'color-mix(in srgb, #34d399 88%, white)' }}
          >
            <p className="text-[9px] font-semibold uppercase text-emerald-700">{t('postCard.price')}</p>
            <p className="text-sm font-bold leading-none text-emerald-800">ETB {post.price}</p>
          </div>
        )}
      </div>
      <div className="mt-3 min-w-0">
        <span
          className="inline-block rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
          style={{
            backgroundColor: isBuyer
              ? 'color-mix(in srgb, #38bdf8 18%, var(--tg-theme-secondary-bg-color))'
              : 'color-mix(in srgb, var(--tg-theme-button-color) 18%, var(--tg-theme-secondary-bg-color))',
            color: isBuyer ? '#38bdf8' : 'var(--tg-theme-link-color, #2dd4bf)',
          }}
        >
          {isBuyer ? t('postCard.buyerRequest') : t('postCard.forSale')}
        </span>
        <h3
          className="mt-2 text-sm font-bold leading-5 text-tg-text"
          style={{
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 2,
            overflow: 'hidden',
          }}
        >
          {post.medicineName}
          {post.strength && <span className="font-medium text-tg-hint"> {post.strength}</span>}
        </h3>
        <div className="mt-2 space-y-1 text-xs text-tg-hint">
          <span className="flex items-center gap-1">
            <IconMapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{post.city}</span>
          </span>
          <p className="truncate">{t('postCard.qty')}: {post.quantity}</p>
          {post.brand && <p className="truncate">{post.brand}</p>}
        </div>
      </div>
    </Link>
  );
}
