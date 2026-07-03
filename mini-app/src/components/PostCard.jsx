import { Link } from 'react-router-dom';
import { IconMapPin } from './Icons';

export default function PostCard({ post }) {
  const isBuyer = post.type === 'buyer';

  return (
    <Link to={`/post/${post._id}`} className="app-card mb-3 block transition-all active:scale-[0.99] hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <span className={`inline-block rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${isBuyer ? 'bg-sky-100 text-sky-700' : 'bg-teal-100 text-teal-700'}`}>
            {isBuyer ? 'Buyer Request' : 'For Sale'}
          </span>
          <h3 className="mt-2 truncate text-base font-bold text-slate-900">
            {post.medicineName}
            {post.strength && <span className="font-medium text-slate-500"> {post.strength}</span>}
          </h3>
        </div>
        {!isBuyer && post.price && (
          <div className="shrink-0 rounded-xl bg-emerald-50 px-3 py-1.5 text-right">
            <p className="text-[10px] font-semibold uppercase text-emerald-600">Price</p>
            <p className="text-sm font-bold text-emerald-700">ETB {post.price}</p>
          </div>
        )}
      </div>
      <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
        <span className="flex items-center gap-1"><IconMapPin className="h-3.5 w-3.5" />{post.city}</span>
        <span className="text-slate-300">|</span>
        <span>Qty: {post.quantity}</span>
      </div>
      {post.brand && <p className="mt-1 text-xs text-slate-400">{post.brand}</p>}
    </Link>
  );
}
