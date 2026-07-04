import { useEffect, useState } from 'react';
import { api } from '../api';
import PostTable from '../components/PostTable';
import RejectModal from '../components/RejectModal';
import ConfirmModal from '../components/ConfirmModal';
import LoadingSpinner from '../components/LoadingSpinner';
import PageHeader from '../components/PageHeader';
import { useToast } from '../components/Toast';

export default function Pending() {
  const { showToast } = useToast();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectPost, setRejectPost] = useState(null);
  const [confirmApprove, setConfirmApprove] = useState(null);
  const [approveLoading, setApproveLoading] = useState(false);

  const loadPosts = () => {
    setLoading(true);
    api.getPendingPosts().then((res) => setPosts(res.data)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { loadPosts(); }, []);

  const handleApprove = async () => {
    setApproveLoading(true);
    try {
      await api.approvePost(confirmApprove);
      showToast('Post approved and published to Telegram');
      setConfirmApprove(null);
      loadPosts();
    } catch (err) {
      showToast(err.message, 'error');
    } finally { setApproveLoading(false); }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pending Review"
        description="Review submitted payments and publish approved posts to Telegram channels."
      />

      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
        <p className="text-sm text-slate-500">{posts.length} post{posts.length !== 1 ? 's' : ''} awaiting review</p>
        <p className="mt-1 text-xs text-slate-400">
          Approve or reject here, or from Telegram bot notifications. Either side works; already-reviewed posts are blocked on the other.
        </p>
      </div>

      {loading ? <LoadingSpinner /> : (
        <PostTable posts={posts} showActions onApprove={setConfirmApprove} onReject={setRejectPost} />
      )}

      {confirmApprove && (
        <ConfirmModal title="Approve & publish?" message="This post will be published to all active Telegram channels and the user will be notified." confirmLabel="Approve" variant="success" loading={approveLoading} onConfirm={handleApprove} onClose={() => setConfirmApprove(null)} />
      )}
      {rejectPost && (
        <RejectModal
          post={rejectPost}
          onClose={() => setRejectPost(null)}
          onConfirm={async (reason) => {
            try {
              await api.rejectPost(rejectPost._id, reason);
              showToast('Post rejected');
              loadPosts();
            } catch (err) {
              showToast(err.message, 'error');
            }
          }}
        />
      )}
    </div>
  );
}
