import { useEffect, useState } from 'react';
import { api } from '../api';
import PostTable from '../components/PostTable';
import RejectModal from '../components/RejectModal';
import ConfirmModal, { AlertBanner } from '../components/ConfirmModal';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Pending() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectPost, setRejectPost] = useState(null);
  const [confirmApprove, setConfirmApprove] = useState(null);
  const [approveLoading, setApproveLoading] = useState(false);
  const [message, setMessage] = useState('');

  const loadPosts = () => {
    setLoading(true);
    api.getPendingPosts().then((res) => setPosts(res.data)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { loadPosts(); }, []);

  const handleApprove = async () => {
    setApproveLoading(true);
    try {
      await api.approvePost(confirmApprove);
      setMessage('Post approved and published to Telegram');
      setConfirmApprove(null);
      loadPosts();
    } catch (err) { alert(err.message); }
    finally { setApproveLoading(false); }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-slate-500">{posts.length} post{posts.length !== 1 ? 's' : ''} awaiting review</p>
      </div>

      {message && <AlertBanner type="success" message={message} onDismiss={() => setMessage('')} />}

      {loading ? <LoadingSpinner /> : (
        <PostTable posts={posts} showActions onApprove={setConfirmApprove} onReject={setRejectPost} />
      )}

      {confirmApprove && (
        <ConfirmModal title="Approve & publish?" message="This post will be published to the Telegram channel and the user will be notified." confirmLabel="Approve" variant="success" loading={approveLoading} onConfirm={handleApprove} onClose={() => setConfirmApprove(null)} />
      )}
      {rejectPost && <RejectModal post={rejectPost} onClose={() => setRejectPost(null)} onConfirm={async (reason) => { await api.rejectPost(rejectPost._id, reason); setMessage('Post rejected'); loadPosts(); }} />}
    </div>
  );
}
