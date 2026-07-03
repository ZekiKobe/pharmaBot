import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import PostCard from '../components/PostCard';

export default function Home() {
  const [buyerPosts, setBuyerPosts] = useState([]);
  const [sellerPosts, setSellerPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [buyers, sellers, cats] = await Promise.all([
          api.getPosts({ type: 'buyer', limit: 5 }),
          api.getPosts({ type: 'seller', limit: 5 }),
          api.getCategories(),
        ]);
        setBuyerPosts(buyers.data);
        setSellerPosts(sellers.data);
        setCategories(cats.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <div className="p-10 text-center text-tg-hint">Loading...</div>;
  }

  return (
    <div className="mx-auto max-w-xl px-4 pb-20 pt-4">
      <div className="my-5 grid grid-cols-2 gap-3">
        <Link
          to="/buyer"
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-center font-semibold text-white active:opacity-80"
        >
          🔍 Request Medicine
        </Link>
        <Link
          to="/seller"
          className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-center font-semibold text-white active:opacity-80"
        >
          💊 Sell Medicine
        </Link>
      </div>

      {categories.length > 0 && (
        <>
          <h2 className="mb-3 mt-5 text-lg font-semibold">Categories</h2>
          <div className="mb-3 flex gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <Link
                key={cat._id}
                to={`/search?category=${cat.slug}`}
                className="shrink-0 rounded-full border border-gray-200 bg-tg-card px-4 py-2 text-sm"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </>
      )}

      <h2 className="mb-3 mt-5 text-lg font-semibold">Latest Buyer Requests</h2>
      {buyerPosts.length === 0 ? (
        <div className="px-5 py-10 text-center text-tg-hint">No buyer requests yet</div>
      ) : (
        buyerPosts.map((post) => <PostCard key={post._id} post={post} />)
      )}

      <h2 className="mb-3 mt-5 text-lg font-semibold">Latest Seller Listings</h2>
      {sellerPosts.length === 0 ? (
        <div className="px-5 py-10 text-center text-tg-hint">No seller listings yet</div>
      ) : (
        sellerPosts.map((post) => <PostCard key={post._id} post={post} />)
      )}
    </div>
  );
}
