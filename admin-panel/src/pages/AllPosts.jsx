import { useEffect, useState } from 'react';
import { api } from '../api';
import PostTable from '../components/PostTable';
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner';

export default function AllPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ approvalStatus: '', type: '' });

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (filter.approvalStatus) params.approvalStatus = filter.approvalStatus;
    if (filter.type) params.type = filter.type;

    api
      .getPosts(params)
      .then((res) => setPosts(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <div>
      <PageHeader
        title="All Posts"
        description="Browse and filter all marketplace listings"
      />

      <div className="card mb-6 flex flex-wrap items-center gap-4 p-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-600">Status</label>
          <select
            value={filter.approvalStatus}
            onChange={(e) => setFilter({ ...filter, approvalStatus: e.target.value })}
            className="input-field w-auto min-w-[140px] py-2"
          >
            <option value="">All statuses</option>
            <option value="draft">Draft</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-600">Type</label>
          <select
            value={filter.type}
            onChange={(e) => setFilter({ ...filter, type: e.target.value })}
            className="input-field w-auto min-w-[120px] py-2"
          >
            <option value="">All types</option>
            <option value="buyer">Buyer</option>
            <option value="seller">Seller</option>
          </select>
        </div>

        <div className="ml-auto text-sm text-slate-500">
          {posts.length} result{posts.length !== 1 ? 's' : ''}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading posts..." />
      ) : (
        <PostTable posts={posts} />
      )}
    </div>
  );
}
