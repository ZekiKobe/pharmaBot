import { useEffect, useState } from 'react';
import { api } from '../api';
import PostTable from '../components/PostTable';
import RejectModal from '../components/RejectModal';
import ConfirmModal, { AlertBanner } from '../components/ConfirmModal';
import PageHeader from '../components/PageHeader';
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
    api
      .getPendingPosts()
      .then((res) => setPosts(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleApprove = async () => {
    setApproveLoading(true);
    try {
      await api.approvePost(confirmApprove);
      setMessage('Post approved and published to Telegram channel');
      setConfirmApprove(null);
      loadPosts();
    } catch (err) {
      alert(err.message);
    } finally {
      setApproveLoading(false);
    }
  };

  const handleReject = async (reason) => {
    await api.rejectPost(rejectPost._id, reason);
    setMessage('Post has been rejected and user notified');
    loadPosts();
  };

  return (
    <div>
      <PageHeader
        title="Pending Review"
        description={`${posts.length} post${posts.length !== 1 ? 's' : ''} awaiting payment verification and approval`}
      />

      {message && (
        <AlertBanner type="success" message={message} onDismiss={() => setMessage('')} />
      )}

      {loading ? (
        <LoadingSpinner label="Loading pending posts..." />
      ) : (
        <PostTable
          posts={posts}
          showActions
          onApprove={setConfirmApprove}
          onReject={setRejectPost}
        />
      )}

      {confirmApprove && (
        <ConfirmModal
          title="Approve post?"
          message="This will publish the post to the Telegram channel and notify the user. This action cannot be undone."
          confirmLabel="Approve & Publish"
          variant="success"
          loading={approveLoading}
          onConfirm={handleApprove}
          onClose={() => setConfirmApprove(null)}
        />
      )}

      {rejectPost && (
        <RejectModal
          post={rejectPost}
          onClose={() => setRejectPost(null)}
          onConfirm={handleReject}
        />
      )}
    </div>
  );
}
