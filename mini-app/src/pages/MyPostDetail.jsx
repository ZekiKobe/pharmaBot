import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import { useTelegram } from '../context/TelegramContext';
import { IconArrowLeft, IconMapPin } from '../components/Icons';
import ContactSection from '../components/ContactSection';
import ConfirmModal from '../components/ConfirmModal';
import { formatCategoryLabel } from '../utils/category';

const statusLabel = {
  draft: { text: 'Draft', color: 'text-tg-hint' },
  pending: { text: 'Pending review', color: 'text-amber-400' },
  approved: { text: 'Approved', color: 'text-emerald-400' },
  rejected: { text: 'Rejected', color: 'text-red-400' },
};

export default function MyPostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { telegramId, haptic } = useTelegram();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const loadPost = () => {
    if (!telegramId) return;
    setLoading(true);
    api
      .getMyPost(id, telegramId)
      .then((res) => setPost(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPost();
  }, [id, telegramId]);

  const canEdit = Boolean(post);
  const canDelete = Boolean(post);

  const handleDeleteConfirm = async () => {
    if (!canDelete || deleting) return;

    setDeleting(true);
    haptic('medium');
    try {
      await api.deleteMyPost(id, telegramId);
      haptic('success');
      navigate('/my-posts', { replace: true });
    } catch (err) {
      haptic('error');
      setError(err.message);
      setShowDeleteModal(false);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-200 border-t-teal-600" />
      </div>
    );
  }

  if (error && !post) {
    return (
      <div className="app-container text-center">
        <p className="text-red-400">{error}</p>
        <Link to="/my-posts" className="mt-4 inline-block text-sm font-semibold text-tg-link">
          Back to My Posts
        </Link>
      </div>
    );
  }

  if (!post) return null;

  const isBuyer = post.type === 'buyer';
  const status = statusLabel[post.approvalStatus] || statusLabel.draft;
  const editPath = isBuyer ? `/buyer/edit/${post._id}` : `/seller/edit/${post._id}`;

  return (
    <div className="app-container">
      <button
        type="button"
        onClick={() => navigate('/my-posts')}
        className="mb-4 flex items-center gap-1 text-sm font-medium text-tg-hint"
      >
        <IconArrowLeft className="h-4 w-4" /> Back to My Posts
      </button>

      <div className="app-card">
        {post.medicineImage && (
          <div
            className="mb-4 rounded-xl p-3"
            style={{
              backgroundColor:
                'color-mix(in srgb, var(--tg-theme-hint-color) 10%, var(--tg-theme-secondary-bg-color))',
            }}
          >
            <p className="text-[10px] font-bold uppercase text-tg-hint">Medicine / Prescription</p>
            <img
              src={api.getUploadUrl(post.medicineImage)}
              alt="Medicine"
              className="mt-2 max-h-56 w-full rounded-lg object-contain"
            />
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span
            className="inline-block rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase"
            style={{
              backgroundColor: isBuyer
                ? 'color-mix(in srgb, #38bdf8 18%, var(--tg-theme-secondary-bg-color))'
                : 'color-mix(in srgb, var(--tg-theme-button-color) 18%, var(--tg-theme-secondary-bg-color))',
              color: isBuyer ? '#38bdf8' : 'var(--tg-theme-link-color)',
            }}
          >
            {isBuyer ? 'Buyer Request' : 'For Sale'}
          </span>
          <span className={`text-xs font-bold capitalize ${status.color}`}>{status.text}</span>
        </div>

        <h1 className="mt-3 text-xl font-bold text-tg-text">
          {post.medicineName}
          {post.strength && <span className="text-tg-hint"> {post.strength}</span>}
        </h1>

        <div className="mt-5 space-y-3">
          {post.brand && <Row label="Brand" value={post.brand} />}
          {!isBuyer && post.category && (
            <Row label="Category" value={formatCategoryLabel(post.category)} />
          )}
          <Row label="Quantity" value={post.quantity} />
          {!isBuyer && post.price != null && <Row label="Price" value={`ETB ${post.price}`} highlight />}
          {!isBuyer && post.expiryDate && (
            <Row label="Expiry" value={new Date(post.expiryDate).toLocaleDateString()} />
          )}
          <div className="flex items-center gap-2 text-sm">
            <IconMapPin className="h-4 w-4 text-tg-link" />
            <span className="font-semibold text-tg-text">{post.city}</span>
          </div>
          {post.description && (
            <div
              className="rounded-xl p-3"
              style={{
                backgroundColor:
                  'color-mix(in srgb, var(--tg-theme-hint-color) 10%, var(--tg-theme-secondary-bg-color))',
              }}
            >
              <p className="text-sm text-tg-text">{post.description}</p>
            </div>
          )}
        </div>

        <ContactSection telegramUsername={post.telegramUsername} contactPhone={post.contactPhone} />

        {post.approvalStatus === 'approved' && post.isActive === false && (
          <p className="mt-4 rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-400">
            This post is hidden from the marketplace by an admin.
          </p>
        )}

        {post.rejectionReason && (
          <p className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {post.rejectionReason}
          </p>
        )}

        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

        {canEdit && (
          <div className={`mt-5 grid gap-3 ${canDelete ? 'grid-cols-2' : 'grid-cols-1'}`}>
            <Link to={editPath} className="btn-app-secondary py-2.5 text-xs">
              Edit
            </Link>
            {canDelete && (
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                disabled={deleting}
                className="rounded-xl border border-red-500/40 bg-red-500/10 py-2.5 text-xs font-semibold text-red-400"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>

      {showDeleteModal && (
        <ConfirmModal
          title="Delete post?"
          message={`"${post.medicineName}" will be permanently removed. This cannot be undone.`}
          confirmLabel="Delete"
          loading={deleting}
          onConfirm={handleDeleteConfirm}
          onClose={() => !deleting && setShowDeleteModal(false)}
        />
      )}
    </div>
  );
}

function Row({ label, value, highlight }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-tg-hint">{label}</span>
      <span className={`font-semibold ${highlight ? 'text-emerald-400' : 'text-tg-text'}`}>{value}</span>
    </div>
  );
}
