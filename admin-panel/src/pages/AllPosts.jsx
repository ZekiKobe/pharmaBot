import { useEffect, useMemo, useState } from 'react';
import { api } from '../api';
import PageHeader from '../components/PageHeader';
import PostTable from '../components/PostTable';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmModal from '../components/ConfirmModal';
import { useToast } from '../components/Toast';
import StatCard from '../components/StatCard';
import { IconPosts, IconCheck, IconClock, IconX } from '../components/Icons';

export default function AllPosts() {
  const { showToast } = useToast();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ approvalStatus: '', type: '', isActive: '' });
  const [postToDelete, setPostToDelete] = useState(null);
  const [toggleTarget, setToggleTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadPosts = () => {
    setLoading(true);
    const params = {};
    if (filter.approvalStatus) params.approvalStatus = filter.approvalStatus;
    if (filter.type) params.type = filter.type;
    if (filter.isActive) params.isActive = filter.isActive;
    api.getPosts(params).then((res) => setPosts(res.data)).catch((err) => showToast(err.message, 'error')).finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPosts();
  }, [filter]);

  const summary = useMemo(() => {
    return posts.reduce(
      (acc, post) => {
        acc.total += 1;
        acc[post.approvalStatus] = (acc[post.approvalStatus] || 0) + 1;
        return acc;
      },
      { total: 0, pending: 0, approved: 0, rejected: 0 }
    );
  }, [posts]);

  const handleDelete = async () => {
    if (!postToDelete) return;
    setActionLoading(true);
    try {
      await api.deletePost(postToDelete._id);
      showToast('Post permanently deleted');
      setPostToDelete(null);
      loadPosts();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleActive = async () => {
    if (!toggleTarget) return;
    setActionLoading(true);
    try {
      await api.setPostActive(toggleTarget.post._id, toggleTarget.nextIsActive);
      showToast(toggleTarget.nextIsActive ? 'Post activated' : 'Post deactivated');
      setToggleTarget(null);
      loadPosts();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="All Posts"
        description="Manage the full marketplace inventory with direct actions for editing, visibility, and deletion."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Loaded" value={summary.total} icon={IconPosts} accent="blue" />
        <StatCard title="Pending" value={summary.pending} icon={IconClock} accent="amber" />
        <StatCard title="Approved" value={summary.approved} icon={IconCheck} accent="emerald" />
        <StatCard title="Rejected" value={summary.rejected} icon={IconX} accent="red" />
      </div>

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

      {loading ? (
        <LoadingSpinner />
      ) : (
        <PostTable
          posts={posts}
          showManagementActions
          onDelete={setPostToDelete}
          onToggleActive={(post, nextIsActive) => setToggleTarget({ post, nextIsActive })}
        />
      )}

      {postToDelete && (
        <ConfirmModal
          title="Delete post permanently?"
          message={`This will permanently remove "${postToDelete.medicineName}" and its payment records. This cannot be undone.`}
          confirmLabel="Delete permanently"
          variant="danger"
          loading={actionLoading}
          onConfirm={handleDelete}
          onClose={() => !actionLoading && setPostToDelete(null)}
        />
      )}

      {toggleTarget && (
        <ConfirmModal
          title={toggleTarget.nextIsActive ? 'Activate post?' : 'Deactivate post?'}
          message={
            toggleTarget.nextIsActive
              ? 'This will make the approved post visible in the marketplace again without reposting it to Telegram.'
              : 'This will hide the approved post from the marketplace without reposting or duplicating it in Telegram later.'
          }
          confirmLabel={toggleTarget.nextIsActive ? 'Activate' : 'Deactivate'}
          variant={toggleTarget.nextIsActive ? 'success' : 'danger'}
          loading={actionLoading}
          onConfirm={handleToggleActive}
          onClose={() => !actionLoading && setToggleTarget(null)}
        />
      )}
    </div>
  );
}
