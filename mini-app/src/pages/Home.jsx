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
      <div className="flex flex-col items-center justify-center py-24">
        <div
          className="h-9 w-9 animate-spin rounded-full border-2 border-t-transparent"
          style={{
            borderColor: 'color-mix(in srgb, var(--tg-theme-button-color) 30%, transparent)',
            borderTopColor: 'var(--tg-theme-button-color)',
          }}
        />
        <p className="mt-4 text-sm text-tg-hint">Loading marketplace...</p>
      </div>
    );
  }

  return (
    <div className="app-container !pt-0">
      <div
        className="relative -mx-4 mb-5 overflow-hidden px-5 pb-7 pt-6"
        style={{
          background: 'linear-gradient(135deg, var(--tg-theme-button-color, #0d9488) 0%, #0f766e 100%)',
        }}
      >
        <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10" />
        <h2 className="relative text-xl font-bold text-white">Find medicines across Ethiopia</h2>
        <p className="relative mt-1.5 text-sm text-white/80">Buy, sell, and connect via Telegram</p>
        <div className="relative mt-5 grid grid-cols-2 gap-3">
          <Link
            to="/buyer"
            className="flex items-center justify-center gap-2 rounded-xl bg-white/20 px-4 py-3.5 text-sm font-semibold text-white transition-transform active:scale-[0.98]"
          >
            <IconBuy className="h-4 w-4" /> Request
          </Link>
          <Link
            to="/seller"
            className="flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3.5 text-sm font-semibold transition-transform active:scale-[0.98]"
            style={{ color: 'var(--tg-theme-button-color, #0d9488)' }}
          >
            <IconSell className="h-4 w-4" /> Sell
          </Link>
        </div>
      </div>

      {categories.length > 0 && (
        <section className="mb-6">
          <h2 className="section-heading">Categories</h2>
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {categories.map((cat) => (
              <Link key={cat._id} to={`/search?category=${cat.slug}`} className="chip">
                {cat.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="section-heading !mb-0">Buyer Requests</h2>
          <Link to="/search?type=buyer" className="text-xs font-semibold text-tg-link">
            See all
          </Link>
        </div>
        {buyerPosts.length === 0 ? (
          <div className="app-card empty-state">No buyer requests yet</div>
        ) : (
          buyerPosts.map((post) => <PostCard key={post._id} post={post} />)
        )}
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="section-heading !mb-0">Seller Listings</h2>
          <Link to="/search?type=seller" className="text-xs font-semibold text-tg-link">
            See all
          </Link>
        </div>
        {sellerPosts.length === 0 ? (
          <div className="app-card empty-state">No listings yet</div>
        ) : (
          sellerPosts.map((post) => <PostCard key={post._id} post={post} />)
        )}
      </section>
    </div>
  );
}
