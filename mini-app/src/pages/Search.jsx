import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api';
import PostCard from '../components/PostCard';
import { IconSearch } from '../components/Icons';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const committedSearch = searchParams.get('search') || '';
  const city = searchParams.get('city') || '';
  const type = searchParams.get('type') || '';
  const category = searchParams.get('category') || '';

  const [inputQuery, setInputQuery] = useState(committedSearch);
  const [posts, setPosts] = useState([]);
  const [cities, setCities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setInputQuery(committedSearch);
  }, [committedSearch]);

  useEffect(() => {
    Promise.all([api.getCities(), api.getCategories()])
      .then(([c, cats]) => {
        setCities(c.data);
        setCategories(cats.data);
      })
      .catch(() => setError('Failed to load search filters.'));
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');

    const params = {};
    if (committedSearch) params.search = committedSearch;
    if (city) params.city = city;
    if (type) params.type = type;
    if (category) params.category = category;

    api
      .getPosts(params, { signal: controller.signal })
      .then((res) => {
        if (!controller.signal.aborted) {
          setPosts(res.data);
        }
      })
      .catch((err) => {
        if (controller.signal.aborted || err.name === 'AbortError') return;
        setPosts([]);
        setError('Failed to load search results.');
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [committedSearch, city, type, category]);

  const updateSearchParams = (next) => {
    const params = new URLSearchParams(searchParams);

    Object.entries(next).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    setSearchParams(params);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    updateSearchParams({ search: inputQuery.trim() });
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
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Medicine name..."
            className="app-input w-full pl-10"
          />
        </div>
        <button type="submit" className="btn-app-primary-compact">
          Go
        </button>
      </form>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        <Chip active={!type} onClick={() => updateSearchParams({ type: '' })}>All</Chip>
        <Chip active={type === 'buyer'} onClick={() => updateSearchParams({ type: 'buyer' })}>Buyer</Chip>
        <Chip active={type === 'seller'} onClick={() => updateSearchParams({ type: 'seller' })}>Seller</Chip>
      </div>

      {cities.length > 0 && (
        <select value={city} onChange={(e) => updateSearchParams({ city: e.target.value })} className="app-input mt-3">
          <option value="">All cities</option>
          {cities.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      )}

      {categories.length > 0 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          <Chip active={!category} onClick={() => updateSearchParams({ category: '' })}>All categories</Chip>
          {categories.map((cat) => (
            <Chip key={cat._id} active={category === cat.slug} onClick={() => updateSearchParams({ category: cat.slug })}>{cat.name}</Chip>
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
