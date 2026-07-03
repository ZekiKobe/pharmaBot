import { useRef, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import { useTelegram } from '../context/TelegramContext';
import { IconArrowLeft } from '../components/Icons';
import FieldError, { ErrorSummary } from '../components/FieldError';
import MedicineImageUpload from '../components/MedicineImageUpload';
import { fieldClass, getFieldError } from '../utils/apiError';

const CITIES = ['Addis Ababa', 'Adama', 'Bahir Dar', 'Dire Dawa', 'Hawassa', 'Mekelle', 'Gondar', 'Jimma', 'Dessie', 'Harar'];

export default function SellerForm() {
  const navigate = useNavigate();
  const { postId } = useParams();
  const isEdit = Boolean(postId);
  const { user, telegramId, haptic } = useTelegram();
  const [loading, setLoading] = useState(false);
  const [loadingPost, setLoadingPost] = useState(isEdit);
  const submittedRef = useRef(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [existingImageUrl, setExistingImageUrl] = useState('');
  const [removeImage, setRemoveImage] = useState(false);
  const [form, setForm] = useState({
    medicineName: '', brand: '', strength: '', quantity: '', price: '', expiryDate: '',
    city: '', description: '', contactPhone: '', telegramUsername: user?.username || '',
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
          brand: post.brand || '',
          strength: post.strength || '',
          quantity: post.quantity || '',
          price: post.price ?? '',
          expiryDate: post.expiryDate ? post.expiryDate.split('T')[0] : '',
          city: post.city || '',
          description: post.description || '',
          contactPhone: post.contactPhone || '',
          telegramUsername: post.telegramUsername || user?.username || '',
        });
        if (post.medicineImage) {
          setExistingImageUrl(api.getUploadUrl(post.medicineImage));
        }
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
        price: form.price === '' ? '' : Number(form.price),
        telegramId,
        fullName: [user?.first_name, user?.last_name].filter(Boolean).join(' '),
      };

      if (isEdit) {
        await api.updateMyPost(postId, payload, imageFile, { removeImage });
        haptic('success');
        navigate(`/my-posts/${postId}`, { replace: true });
        return;
      }

      const res = await api.createSellerPost(payload, imageFile);

      const newPostId = res?.data?._id;
      if (!newPostId) {
        throw new Error('Listing created but ID was missing. Check My Posts.');
      }

      submittedRef.current = true;
      haptic('success');
      navigate(`/payment/${newPostId}`);
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
      <h1 className="text-xl font-bold text-tg-text">{isEdit ? 'Edit Seller Listing' : 'Seller Listing'}</h1>
      <p className="mt-1 text-sm text-tg-hint">
        {isEdit ? 'Update your listing' : 'List your medicine for ETB 20'}
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="app-label">Medicine Name *</label>
          <input name="medicineName" value={form.medicineName} onChange={set} className={fieldClass(fieldErrors, 'medicineName')} />
          <FieldError message={getFieldError(fieldErrors, 'medicineName')} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="app-label">Brand *</label>
            <input name="brand" value={form.brand} onChange={set} className={fieldClass(fieldErrors, 'brand')} />
            <FieldError message={getFieldError(fieldErrors, 'brand')} />
          </div>
          <div>
            <label className="app-label">Strength *</label>
            <input name="strength" value={form.strength} onChange={set} className={fieldClass(fieldErrors, 'strength')} placeholder="500mg" />
            <FieldError message={getFieldError(fieldErrors, 'strength')} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="app-label">Quantity *</label>
            <input name="quantity" value={form.quantity} onChange={set} className={fieldClass(fieldErrors, 'quantity')} />
            <FieldError message={getFieldError(fieldErrors, 'quantity')} />
          </div>
          <div>
            <label className="app-label">Price (ETB) *</label>
            <input name="price" type="number" value={form.price} onChange={set} min="1" step="0.01" className={fieldClass(fieldErrors, 'price')} />
            <FieldError message={getFieldError(fieldErrors, 'price')} />
          </div>
        </div>
        <div>
          <label className="app-label">Expiry Date *</label>
          <input name="expiryDate" type="date" value={form.expiryDate} onChange={set} className={fieldClass(fieldErrors, 'expiryDate')} />
          <FieldError message={getFieldError(fieldErrors, 'expiryDate')} />
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
          <textarea name="description" value={form.description} onChange={set} className={`${fieldClass(fieldErrors, 'description')} min-h-24 resize-none`} />
          <FieldError message={getFieldError(fieldErrors, 'description')} />
        </div>

        <MedicineImageUpload
          hint="Optional. Add a photo of the medicine or packaging."
          preview={imagePreview}
          existingUrl={!removeImage ? existingImageUrl : ''}
          onSelect={(file) => {
            if (file.size > 5 * 1024 * 1024) {
              setError('Image must be 5MB or smaller');
              return;
            }
            setImageFile(file);
            setRemoveImage(false);
            setImagePreview(URL.createObjectURL(file));
          }}
          onClear={() => {
            setImageFile(null);
            setImagePreview('');
            setExistingImageUrl('');
            setRemoveImage(true);
          }}
          error={getFieldError(fieldErrors, 'medicineImage')}
        />

        <div>
          <label className="app-label">Phone *</label>
          <input name="contactPhone" value={form.contactPhone} onChange={set} type="tel" className={fieldClass(fieldErrors, 'contactPhone')} placeholder="0911234567" />
          <FieldError message={getFieldError(fieldErrors, 'contactPhone')} />
        </div>
        <div>
          <label className="app-label">Telegram Username</label>
          <input name="telegramUsername" value={form.telegramUsername} onChange={set} className={fieldClass(fieldErrors, 'telegramUsername')} />
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
