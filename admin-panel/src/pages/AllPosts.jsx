import { useEffect, useState } from 'react';
import { api } from '../api';
import PageHeader from '../components/PageHeader';
import PostTable from '../components/PostTable';
import LoadingSpinner from '../components/LoadingSpinner';

export default function AllPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ approvalStatus: '', type: '', isActive: '' });

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (filter.approvalStatus) params.approvalStatus = filter.approvalStatus;
    if (filter.type) params.type = filter.type;
    if (filter.isActive) params.isActive = filter.isActive;
    api.getPosts(params).then((res) => setPosts(res.data)).catch(console.error).finally(() => setLoading(false));
  }, [filter]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="All Posts"
        description="Search the full marketplace inventory by status, type, and visibility."
      />

      <div className="card p-4 sm:p-5">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-end">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Approval status
            </label>
            <select value={filter.approvalStatus} onChange={(e) => setFilter({ ...filter, approvalStatus: e.target.value })} className="input-field py-2.5">
              <option value="">All statuses</option>
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Post type
            </label>
            <select value={filter.type} onChange={(e) => setFilter({ ...filter, type: e.target.value })} className="input-field py-2.5">
              <option value="">All types</option>
              <option value="buyer">Buyer</option>
              <option value="seller">Seller</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Visibility
            </label>
            <select value={filter.isActive} onChange={(e) => setFilter({ ...filter, isActive: e.target.value })} className="input-field py-2.5">
              <option value="">All visibility</option>
              <option value="true">Active only</option>
              <option value="false">Inactive only</option>
            </select>
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-500">
            {posts.length} results
          </div>
        </div>
      </div>
      {loading ? <LoadingSpinner /> : <PostTable posts={posts} />}
    </div>
  );
}
