import { useRef, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import { useTelegram } from '../context/TelegramContext';
import { useLanguage } from '../context/LanguageContext';
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
  const { t, tCategory } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [loadingPost, setLoadingPost] = useState(isEdit);
  const submittedRef = useRef(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [existingImageUrl, setExistingImageUrl] = useState('');
  const [removeImage, setRemoveImage] = useState(false);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    medicineName: '', brand: '', strength: '', quantity: '', price: '', expiryDate: '',
    city: '', category: '', description: '', contactPhone: '', telegramUsername: user?.username || '',
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
    api
      .getCategories()
      .then((res) => setCategories(res.data || []))
      .catch(() => setError(t('sellerForm.categoriesError')));
  }, [t]);

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
          category: post.category || '',
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
      const msg = t('common.telegramIdMissing');
      setError(msg);
      setFieldErrors({ telegramId: msg });
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
        throw new Error(t('sellerForm.postIdMissing'));
      }

      submittedRef.current = true;
      haptic('success');
      navigate(`/payment/${newPostId}`);
    } catch (err) {
      haptic('error');
      setError(err.message || t('buyerForm.somethingWrong'));
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
        <IconArrowLeft className="h-4 w-4" /> {t('common.back')}
      </button>
      <h1 className="text-xl font-bold text-tg-text">{isEdit ? t('sellerForm.editTitle') : t('sellerForm.title')}</h1>
      <p className="mt-1 text-sm text-tg-hint">
        {isEdit ? t('sellerForm.editSubtitle') : t('sellerForm.subtitle')}
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="app-label">{t('buyerForm.medicineName')} *</label>
          <input
            name="medicineName"
            value={form.medicineName}
            onChange={set}
            className={fieldClass(fieldErrors, 'medicineName')}
            placeholder={t('buyerForm.placeholderMedicine')}
          />
          <FieldError message={getFieldError(fieldErrors, 'medicineName')} />
        </div>
        <div>
          <label className="app-label">{t('sellerForm.category')} *</label>
          <select name="category" value={form.category} onChange={set} className={fieldClass(fieldErrors, 'category')}>
            <option value="">{t('sellerForm.selectCategory')}</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat.slug}>
                {tCategory(cat.slug) || cat.name}
              </option>
            ))}
          </select>
          <FieldError message={getFieldError(fieldErrors, 'category')} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="app-label">{t('sellerForm.brand')} *</label>
            <input
              name="brand"
              value={form.brand}
              onChange={set}
              className={fieldClass(fieldErrors, 'brand')}
              placeholder={t('sellerForm.placeholderBrand')}
            />
            <FieldError message={getFieldError(fieldErrors, 'brand')} />
          </div>
          <div>
            <label className="app-label">{t('buyerForm.strength')} *</label>
            <input
              name="strength"
              value={form.strength}
              onChange={set}
              className={fieldClass(fieldErrors, 'strength')}
              placeholder={t('buyerForm.placeholderStrength')}
            />
            <FieldError message={getFieldError(fieldErrors, 'strength')} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="app-label">{t('buyerForm.quantity')} *</label>
            <input
              name="quantity"
              value={form.quantity}
              onChange={set}
              className={fieldClass(fieldErrors, 'quantity')}
              placeholder={t('buyerForm.placeholderQuantity')}
            />
            <FieldError message={getFieldError(fieldErrors, 'quantity')} />
          </div>
          <div>
            <label className="app-label">{t('sellerForm.price')} *</label>
            <input
              name="price"
              type="number"
              value={form.price}
              onChange={set}
              min="1"
              step="0.01"
              className={fieldClass(fieldErrors, 'price')}
              placeholder={t('sellerForm.placeholderPrice')}
            />
            <FieldError message={getFieldError(fieldErrors, 'price')} />
          </div>
        </div>
        <div>
          <label className="app-label">{t('sellerForm.expiryDate')} *</label>
          <input name="expiryDate" type="date" value={form.expiryDate} onChange={set} className={fieldClass(fieldErrors, 'expiryDate')} />
          <FieldError message={getFieldError(fieldErrors, 'expiryDate')} />
        </div>
        <div>
          <label className="app-label">{t('buyerForm.city')} *</label>
          <select name="city" value={form.city} onChange={set} className={fieldClass(fieldErrors, 'city')}>
            <option value="">{t('buyerForm.selectCity')}</option>
            {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <FieldError message={getFieldError(fieldErrors, 'city')} />
        </div>
        <div>
          <label className="app-label">{t('buyerForm.description')}</label>
          <textarea
            name="description"
            value={form.description}
            onChange={set}
            className={`${fieldClass(fieldErrors, 'description')} min-h-24 resize-none`}
            placeholder={t('buyerForm.placeholderDescription')}
          />
          <FieldError message={getFieldError(fieldErrors, 'description')} />
        </div>

        <MedicineImageUpload
          hint={t('sellerForm.imageHint')}
          preview={imagePreview}
          existingUrl={!removeImage ? existingImageUrl : ''}
          onSelect={(file) => {
            if (file.size > 5 * 1024 * 1024) {
              setError(t('buyerForm.imageTooLarge'));
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
          <label className="app-label">{t('buyerForm.phone')} *</label>
          <input name="contactPhone" value={form.contactPhone} onChange={set} type="tel" className={fieldClass(fieldErrors, 'contactPhone')} placeholder={t('buyerForm.placeholderPhone')} />
          <FieldError message={getFieldError(fieldErrors, 'contactPhone')} />
        </div>
        <div>
          <label className="app-label">{t('buyerForm.telegramUsername')}</label>
          <input
            name="telegramUsername"
            value={form.telegramUsername}
            onChange={set}
            className={fieldClass(fieldErrors, 'telegramUsername')}
            placeholder={t('buyerForm.placeholderUsername')}
          />
          <FieldError message={getFieldError(fieldErrors, 'telegramUsername')} />
        </div>

        {(error || Object.keys(fieldErrors).length > 0) && (
          <ErrorSummary message={error} fieldErrors={fieldErrors} />
        )}

        <button type="submit" disabled={loading} className="btn-app-primary">
          {loading ? t('buyerForm.saving') : isEdit ? t('buyerForm.saveChanges') : t('buyerForm.continuePayment')}
        </button>
      </form>
    </div>
  );
}
