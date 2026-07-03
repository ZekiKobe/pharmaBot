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

  useEffect(() => {
    Promise.all([api.getCities(), api.getCategories()]).then(([c, cats]) => {
      setCities(c.data);
      setCategories(cats.data);
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (query) params.search = query;
    if (city) params.city = city;
    if (type) params.type = type;
    if (category) params.category = category;
    api.getPosts(params).then((res) => setPosts(res.data)).catch(console.error).finally(() => setLoading(false));
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
    <button type="button" onClick={onClick} className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-all ${active ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20' : 'border border-slate-200 bg-tg-card text-slate-600'}`}>
      {children}
    </button>
  );

  return (
    <div className="app-container">
      <h1 className="text-xl font-bold text-slate-900">Search</h1>
      <p className="mt-1 text-sm text-slate-500">Find medicines across Ethiopia</p>

      <form onSubmit={handleSearch} className="mt-5 flex gap-2">
        <div className="relative flex-1">
          <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Medicine name..." className="app-input pl-10" />
        </div>
        <button type="submit" className="shrink-0 rounded-xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white">Go</button>
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

      <div className="mt-5">
        {loading ? (
          <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-200 border-t-teal-600" /></div>
        ) : posts.length === 0 ? (
          <div className="app-card py-10 text-center text-sm text-slate-400">No results found</div>
        ) : posts.map((post) => <PostCard key={post._id} post={post} />)}
      </div>
    </div>
  );
}
