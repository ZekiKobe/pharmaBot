import { useRef, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import { useTelegram } from '../context/TelegramContext';
import { IconArrowLeft } from '../components/Icons';
import FieldError, { ErrorSummary } from '../components/FieldError';
import { fieldClass, getFieldError } from '../utils/apiError';

const CITIES = ['Addis Ababa', 'Adama', 'Bahir Dar', 'Dire Dawa', 'Hawassa', 'Mekelle', 'Gondar', 'Jimma', 'Dessie', 'Harar'];

export default function BuyerForm() {
  const navigate = useNavigate();
  const { postId } = useParams();
  const isEdit = Boolean(postId);
  const { user, telegramId, haptic } = useTelegram();
  const [loading, setLoading] = useState(false);
  const [loadingPost, setLoadingPost] = useState(isEdit);
  const submittedRef = useRef(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [form, setForm] = useState({
    medicineName: '', strength: '', quantity: '', city: '', description: '',
    contactPhone: '', telegramUsername: user?.username || '',
  });

  const set = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  useEffect(() => {
    if (!isEdit || !telegramId) return;
    api
      .getMyPost(postId, telegramId)
      .then((res) => {
        const post = res.data;
        setForm({
          medicineName: post.medicineName || '',
          strength: post.strength || '',
          quantity: post.quantity || '',
          city: post.city || '',
          description: post.description || '',
          contactPhone: post.contactPhone || '',
          telegramUsername: post.telegramUsername || user?.username || '',
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoadingPost(false));
  }, [isEdit, postId, telegramId, user?.username]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading || submittedRef.current) return;

    setLoading(true);
    setError('');
    setFieldErrors({});
    haptic('medium');

    if (!telegramId) {
      setError('Telegram user ID is missing. Open this app from Telegram.');
      setFieldErrors({ telegramId: 'Telegram user ID is missing. Open this app from Telegram.' });
      setLoading(false);
      return;
    }

    try {
      const payload = {
        ...form,
        telegramId,
        fullName: [user?.first_name, user?.last_name].filter(Boolean).join(' '),
      };

      if (isEdit) {
        await api.updateMyPost(postId, payload);
        haptic('success');
        navigate(`/my-posts/${postId}`, { replace: true });
        return;
      }

      const res = await api.createBuyerPost(payload);

      const postId = res?.data?._id;
      if (!postId) {
        throw new Error('Post created but ID was missing. Check My Posts.');
      }

      submittedRef.current = true;
      haptic('success');
      navigate(`/payment/${postId}`);
    } catch (err) {
      haptic('error');
      setError(err.message || 'Something went wrong');
      setFieldErrors(err.fieldErrors || {});
    } finally {
      setLoading(false);
    }
  };

  if (loadingPost) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-200 border-t-teal-600" />
      </div>
    );
  }

  return (
    <div className="app-container">
      <button onClick={() => navigate(isEdit ? `/my-posts/${postId}` : -1)} className="mb-4 flex items-center gap-1 text-sm font-medium text-tg-hint">
        <IconArrowLeft className="h-4 w-4" /> Back
      </button>
      <h1 className="text-xl font-bold text-tg-text">{isEdit ? 'Edit Buyer Request' : 'Buyer Request'}</h1>
      <p className="mt-1 text-sm text-tg-hint">
        {isEdit ? 'Update your medicine request' : 'Post your medicine need for ETB 20'}
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="app-label">Medicine Name *</label>
          <input name="medicineName" value={form.medicineName} onChange={set} className={fieldClass(fieldErrors, 'medicineName')} placeholder="e.g. Paracetamol" />
          <FieldError message={getFieldError(fieldErrors, 'medicineName')} />
        </div>
        <div>
          <label className="app-label">Strength</label>
          <input name="strength" value={form.strength} onChange={set} className={fieldClass(fieldErrors, 'strength')} placeholder="e.g. 500mg" />
          <FieldError message={getFieldError(fieldErrors, 'strength')} />
        </div>
        <div>
          <label className="app-label">Quantity *</label>
          <input name="quantity" value={form.quantity} onChange={set} className={fieldClass(fieldErrors, 'quantity')} placeholder="e.g. 50 Boxes" />
          <FieldError message={getFieldError(fieldErrors, 'quantity')} />
        </div>
        <div>
          <label className="app-label">City *</label>
          <select name="city" value={form.city} onChange={set} className={fieldClass(fieldErrors, 'city')}>
            <option value="">Select city</option>
            {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <FieldError message={getFieldError(fieldErrors, 'city')} />
        </div>
        <div>
          <label className="app-label">Description</label>
          <textarea name="description" value={form.description} onChange={set} className={`${fieldClass(fieldErrors, 'description')} min-h-24 resize-none`} placeholder="Additional details..." />
          <FieldError message={getFieldError(fieldErrors, 'description')} />
        </div>
        <div>
          <label className="app-label">Phone *</label>
          <input name="contactPhone" value={form.contactPhone} onChange={set} type="tel" className={fieldClass(fieldErrors, 'contactPhone')} placeholder="0911234567" />
          <FieldError message={getFieldError(fieldErrors, 'contactPhone')} />
        </div>
        <div>
          <label className="app-label">Telegram Username</label>
          <input name="telegramUsername" value={form.telegramUsername} onChange={set} className={fieldClass(fieldErrors, 'telegramUsername')} placeholder="@username" />
          <FieldError message={getFieldError(fieldErrors, 'telegramUsername')} />
        </div>

        {(error || Object.keys(fieldErrors).length > 0) && (
          <ErrorSummary message={error} fieldErrors={fieldErrors} />
        )}

        <button type="submit" disabled={loading} className="btn-app-primary">
          {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Continue to Payment'}
        </button>
      </form>
    </div>
  );
}
