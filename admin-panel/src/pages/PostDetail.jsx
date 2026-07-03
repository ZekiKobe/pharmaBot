import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api';
import StatusBadge, { TypeBadge } from '../components/StatusBadge';
import RejectModal from '../components/RejectModal';
import ConfirmModal from '../components/ConfirmModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../components/Toast';
import { IconArrowLeft, IconCheck, IconX } from '../components/Icons';

function DetailRow({ label, value, highlight }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-50 py-3 last:border-0">
      <dt className="shrink-0 text-sm text-slate-500">{label}</dt>
      <dd className={`text-right text-sm font-medium ${highlight ? 'text-emerald-600' : 'text-slate-900'}`}>
        {value}
      </dd>
    </div>
  );
}

export default function PostDetail() {
  const { id } = useParams();
  const { showToast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showReject, setShowReject] = useState(false);
  const [showApprove, setShowApprove] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const loadPost = () => {
    setLoading(true);
    api
      .getPost(id)
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPost();
  }, [id]);

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await api.approvePost(id);
      setShowApprove(false);
      showToast('Post approved and published to Telegram');
      loadPost();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (reason) => {
    try {
      await api.rejectPost(id, reason);
      showToast('Post rejected');
      loadPost();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  if (loading) return <LoadingSpinner label="Loading post details..." />;

  if (error) {
    return (
      <div className="card p-8 text-center">
        <p className="text-red-600">{error}</p>
        <Link to="/posts" className="btn-secondary mt-4 inline-flex">
          <IconArrowLeft /> Back to posts
        </Link>
      </div>
    );
  }

  if (!data) return null;

  const { post, payment } = data;
  const isBuyer = post.type === 'buyer';
  const screenshot = post.paymentScreenshot || payment?.screenshot;

  return (
    <div>
      <Link
        to="/posts"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
      >
        <IconArrowLeft />
        Back to all posts
      </Link>

      <div className="card mb-6 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <TypeBadge type={post.type} />
              <StatusBadge status={post.approvalStatus} />
            </div>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
              {post.medicineName}
              {post.strength && (
                <span className="font-normal text-slate-500"> {post.strength}</span>
              )}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Submitted {new Date(post.createdAt).toLocaleString('en-GB', {
                day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
              })}
            </p>
          </div>

          {post.approvalStatus === 'pending' && (
            <div className="flex gap-2">
              <button onClick={() => setShowApprove(true)} className="btn-success">
                <IconCheck />
                Approve
              </button>
              <button onClick={() => setShowReject(true)} className="btn-danger">
                <IconX />
                Reject
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          <div className="card p-6">
            <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider text-slate-400">
              Medicine Details
            </h2>
            <dl className="mt-3">
              <DetailRow
                label="Medicine"
                value={`${post.medicineName}${post.strength ? ` ${post.strength}` : ''}`}
              />
              {post.brand && <DetailRow label="Brand" value={post.brand} />}
              <DetailRow label="Quantity" value={post.quantity} />
              {!isBuyer && post.price && (
                <DetailRow label="Price" value={`ETB ${post.price}`} highlight />
              )}
              {!isBuyer && post.expiryDate && (
                <DetailRow label="Expiry" value={new Date(post.expiryDate).toLocaleDateString()} />
              )}
              <DetailRow label="City" value={post.city} />
            </dl>
            {post.description && (
              <div className="mt-4 rounded-lg bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Description</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-700">{post.description}</p>
              </div>
            )}
          </div>

          {screenshot && (
            <div className="card p-6">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
                Payment Screenshot
              </h2>
              <a
                href={api.getUploadUrl(screenshot)}
                target="_blank"
                rel="noreferrer"
                className="group block overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
              >
                <img
                  src={api.getUploadUrl(screenshot)}
                  alt="Payment screenshot"
                  className="max-h-96 w-full object-contain transition-transform group-hover:scale-[1.02]"
                />
              </a>
              <p className="mt-2 text-center text-xs text-slate-400">Click to open full size</p>
            </div>
          )}
        </div>

        <div className="space-y-6 lg:col-span-2">
          <div className="card p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
              Contact
            </h2>
            <dl>
              <DetailRow label="Phone" value={post.contactPhone} />
              {post.telegramUsername && (
                <DetailRow label="Telegram" value={`@${post.telegramUsername.replace('@', '')}`} />
              )}
            </dl>
          </div>

          {post.userId && (
            <div className="card p-6">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
                User
              </h2>
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 text-sm font-bold text-teal-700">
                  {(post.userId.fullName || post.userId.username || '?').charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-slate-900">{post.userId.fullName || 'Unknown'}</p>
                  {post.userId.username && (
                    <p className="text-sm text-slate-500">@{post.userId.username}</p>
                  )}
                </div>
              </div>
              <dl>
                <DetailRow label="Telegram ID" value={post.userId.telegramId} />
              </dl>
            </div>
          )}

          <div className="card p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
              Payment
            </h2>
            <dl>
              <DetailRow label="Amount" value={`ETB ${post.amount || 20}`} highlight />
              <DetailRow label="Status" value={post.paymentStatus} />
            </dl>
          </div>
        </div>
      </div>

      {post.rejectionReason && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4">
          <p className="text-sm font-semibold text-red-800">Rejection reason</p>
          <p className="mt-1 text-sm text-red-700">{post.rejectionReason}</p>
        </div>
      )}

      {showApprove && (
        <ConfirmModal
          title="Approve post?"
          message="This will publish the post to the Telegram channel and notify the user."
          confirmLabel="Approve & Publish"
          variant="success"
          loading={actionLoading}
          onConfirm={handleApprove}
          onClose={() => setShowApprove(false)}
        />
      )}

      {showReject && (
        <RejectModal
          post={post}
          onClose={() => setShowReject(false)}
          onConfirm={handleReject}
        />
      )}
    </div>
  );
}
