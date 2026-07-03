import { Link } from 'react-router-dom';
import { IconMapPin } from './Icons';

export default function PostCard({ post }) {
  const isBuyer = post.type === 'buyer';

  return (
    <Link
      to={`/post/${post._id}`}
      className="app-card mb-3 block transition-transform active:scale-[0.99]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <span
            className="inline-block rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
            style={{
              backgroundColor: isBuyer
                ? 'color-mix(in srgb, #38bdf8 18%, var(--tg-theme-secondary-bg-color))'
                : 'color-mix(in srgb, var(--tg-theme-button-color) 18%, var(--tg-theme-secondary-bg-color))',
              color: isBuyer ? '#38bdf8' : 'var(--tg-theme-link-color, #2dd4bf)',
            }}
          >
            {isBuyer ? 'Buyer Request' : 'For Sale'}
          </span>
          <h3 className="mt-2 truncate text-base font-bold text-tg-text">
            {post.medicineName}
            {post.strength && <span className="font-medium text-tg-hint"> {post.strength}</span>}
          </h3>
        </div>
        {!isBuyer && post.price && (
          <div
            className="shrink-0 rounded-xl px-3 py-1.5 text-right"
            style={{ backgroundColor: 'color-mix(in srgb, #34d399 15%, var(--tg-theme-secondary-bg-color))' }}
          >
            <p className="text-[10px] font-semibold uppercase text-emerald-500">Price</p>
            <p className="text-sm font-bold text-emerald-600">ETB {post.price}</p>
          </div>
        )}
      </div>
      <div className="mt-3 flex items-center gap-3 text-xs text-tg-hint">
        <span className="flex items-center gap-1">
          <IconMapPin className="h-3.5 w-3.5" />
          {post.city}
        </span>
        <span style={{ color: 'color-mix(in srgb, var(--tg-theme-hint-color) 50%, transparent)' }}>|</span>
        <span>Qty: {post.quantity}</span>
      </div>
      {post.brand && <p className="mt-1 text-xs text-tg-hint">{post.brand}</p>}
    </Link>
  );
}
