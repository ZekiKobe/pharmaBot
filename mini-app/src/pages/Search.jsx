import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api';
import PostCard from '../components/PostCard';
import { IconSearch } from '../components/Icons';

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
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.getCities(), api.getCategories()])
      .then(([c, cats]) => {
        setCities(c.data);
        setCategories(cats.data);
      })
      .catch(() => setError('Failed to load search filters.'));
  }, []);

  useEffect(() => {
    setLoading(true);
    setError('');
    const params = {};
    if (query) params.search = query;
    if (city) params.city = city;
    if (type) params.type = type;
    if (category) params.category = category;
    api
      .getPosts(params)
      .then((res) => setPosts(res.data))
      .catch(() => {
        setPosts([]);
        setError('Failed to load search results.');
      })
      .finally(() => setLoading(false));
  }, [query, city, type, category]);

  const handleSearch = (e) => {
    e.preventDefault();
    const p = {};
    if (query) p.search = query;
    if (city) p.city = city;
    if (type) p.type = type;
    if (category) p.category = category;
    setSearchParams(p);
  };

  const Chip = ({ active, onClick, children }) => (
    <button type="button" onClick={onClick} className={`chip ${active ? 'chip-active' : ''}`}>
      {children}
    </button>
  );

  return (
    <div className="app-container">
      <h1 className="text-xl font-bold text-tg-text">Search</h1>
      <p className="mt-1 text-sm text-tg-hint">Find medicines across Ethiopia</p>

      <form onSubmit={handleSearch} className="mt-5 flex items-stretch gap-2">
        <div className="relative min-w-0 flex-1">
          <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-tg-hint" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Medicine name..."
            className="app-input w-full pl-10"
          />
        </div>
        <button type="submit" className="btn-app-primary-compact">
          Go
        </button>
      </form>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        <Chip active={!type} onClick={() => setType('')}>All</Chip>
        <Chip active={type === 'buyer'} onClick={() => setType('buyer')}>Buyer</Chip>
        <Chip active={type === 'seller'} onClick={() => setType('seller')}>Seller</Chip>
      </div>

      {cities.length > 0 && (
        <select value={city} onChange={(e) => setCity(e.target.value)} className="app-input mt-3">
          <option value="">All cities</option>
          {cities.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      )}

      {categories.length > 0 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          <Chip active={!category} onClick={() => setCategory('')}>All categories</Chip>
          {categories.map((cat) => (
            <Chip key={cat._id} active={category === cat.slug} onClick={() => setCategory(cat.slug)}>{cat.name}</Chip>
          ))}
        </div>
      )}

      {error && (
        <div className="app-card mt-4 text-sm text-red-500">
          {error}
        </div>
      )}

      <div className="mt-5">
        {loading ? (
          <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-200 border-t-teal-600" /></div>
        ) : posts.length === 0 ? (
          <div className="app-card empty-state">No results found</div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {posts.map((post) => <PostCard key={post._id} post={post} />)}
          </div>
        )}
      </div>
    </div>
  );
}
