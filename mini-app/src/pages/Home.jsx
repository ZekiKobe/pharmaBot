import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import PostCard from '../components/PostCard';
import { IconBuy, IconSell } from '../components/Icons';

export default function Home() {
  const [buyerPosts, setBuyerPosts] = useState([]);
  const [sellerPosts, setSellerPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getPosts({ type: 'buyer', limit: 5 }),
      api.getPosts({ type: 'seller', limit: 5 }),
      api.getCategories(),
    ])
      .then(([buyers, sellers, cats]) => {
        setBuyerPosts(buyers.data);
        setSellerPosts(sellers.data);
        setCategories(cats.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-200 border-t-teal-600" />
        <p className="mt-3 text-sm text-slate-400">Loading marketplace...</p>
      </div>
    );
  }

  return (
    <div className="app-container !pt-0">
      <div className="relative -mx-4 mb-6 overflow-hidden bg-gradient-to-br from-teal-600 to-teal-800 px-5 py-8 text-white">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <h2 className="relative text-xl font-bold">Find medicines across Ethiopia</h2>
        <p className="relative mt-1 text-sm text-teal-100">Buy, sell, and connect via Telegram</p>
        <div className="relative mt-5 grid grid-cols-2 gap-3">
          <Link to="/buyer" className="flex items-center justify-center gap-2 rounded-xl bg-white/15 px-4 py-3 text-sm font-semibold backdrop-blur-sm transition-all active:scale-[0.98] hover:bg-white/25">
            <IconBuy className="h-4 w-4" /> Request
          </Link>
          <Link to="/seller" className="flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-teal-700 shadow-lg transition-all active:scale-[0.98]">
            <IconSell className="h-4 w-4" /> Sell
          </Link>
        </div>
      </div>

      {categories.length > 0 && (
        <section className="mb-6">
          <h2 className="section-heading">Categories</h2>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <Link key={cat._id} to={`/search?category=${cat.slug}`} className="shrink-0 rounded-full border border-slate-200 bg-tg-card px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm">
                {cat.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="section-heading !mb-0">Buyer Requests</h2>
          <Link to="/search?type=buyer" className="text-xs font-semibold text-teal-600">See all</Link>
        </div>
        {buyerPosts.length === 0 ? (
          <div className="app-card py-8 text-center text-sm text-slate-400">No buyer requests yet</div>
        ) : buyerPosts.map((post) => <PostCard key={post._id} post={post} />)}
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="section-heading !mb-0">Seller Listings</h2>
          <Link to="/search?type=seller" className="text-xs font-semibold text-teal-600">See all</Link>
        </div>
        {sellerPosts.length === 0 ? (
          <div className="app-card py-8 text-center text-sm text-slate-400">No listings yet</div>
        ) : sellerPosts.map((post) => <PostCard key={post._id} post={post} />)}
      </section>
    </div>
  );
}
