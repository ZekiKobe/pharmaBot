import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api';
import PostCard from '../components/PostCard';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('search') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [type, setType] = useState(searchParams.get('type') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [posts, setPosts] = useState([]);
  const [cities, setCities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getCities(), api.getCategories()])
      .then(([citiesRes, catsRes]) => {
        setCities(citiesRes.data);
        setCategories(catsRes.data);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    async function search() {
      setLoading(true);
      try {
        const params = {};
        if (query) params.search = query;
        if (city) params.city = city;
        if (type) params.type = type;
        if (category) params.category = category;

        const res = await api.getPosts(params);
        setPosts(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    search();
  }, [query, city, type, category]);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = {};
    if (query) params.search = query;
    if (city) params.city = city;
    if (type) params.type = type;
    if (category) params.category = category;
    setSearchParams(params);
  };

  return (
    <div className="mx-auto max-w-xl px-4 pb-20 pt-4">
      <h1 className="mb-4 text-2xl font-bold">🔍 Search Medicines</h1>

      <form onSubmit={handleSearch} className="mb-4 flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search medicine name..."
          className="flex-1 rounded-xl border border-gray-200 bg-tg-card px-3 py-3 focus:border-blue-500 focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white"
        >
          Search
        </button>
      </form>

      <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
        {['', 'buyer', 'seller'].map((t) => (
          <button
            key={t || 'all'}
            type="button"
            onClick={() => setType(t)}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm ${
              type === t
                ? 'border-blue-600 bg-blue-600 text-white'
                : 'border-gray-200 bg-tg-card'
            }`}
          >
            {t === '' ? 'All' : t === 'buyer' ? 'Buyer' : 'Seller'}
          </button>
        ))}
      </div>

      {cities.length > 0 && (
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="mb-4 w-full rounded-xl border border-gray-200 bg-tg-card px-3 py-3 focus:border-blue-500 focus:outline-none"
        >
          <option value="">All Cities</option>
          {cities.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      )}

      {categories.length > 0 && (
        <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
          <button
            type="button"
            onClick={() => setCategory('')}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm ${
              !category ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-200 bg-tg-card'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              type="button"
              onClick={() => setCategory(cat.slug)}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm ${
                category === cat.slug
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-gray-200 bg-tg-card'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="p-10 text-center text-tg-hint">Searching...</div>
      ) : posts.length === 0 ? (
        <div className="px-5 py-10 text-center text-tg-hint">No results found</div>
      ) : (
        posts.map((post) => <PostCard key={post._id} post={post} />)
      )}
    </div>
  );
}
