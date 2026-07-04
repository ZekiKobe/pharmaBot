import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';
import PageHeader from '../components/PageHeader';
import { useToast } from '../components/Toast';
import { IconArrowLeft } from '../components/Icons';

const CITIES = ['Addis Ababa', 'Adama', 'Bahir Dar', 'Dire Dawa', 'Hawassa', 'Mekelle', 'Gondar', 'Jimma', 'Dessie', 'Harar'];

function FieldError({ message }) {
  if (!message) return null;
  return <p className="mt-1 text-xs font-medium text-red-600">{message}</p>;
}

export default function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [post, setPost] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [form, setForm] = useState({
    medicineName: '',
    brand: '',
    strength: '',
    quantity: '',
    price: '',
    expiryDate: '',
    city: '',
    category: '',
    description: '',
    contactPhone: '',
    telegramUsername: '',
  });

  useEffect(() => {
    Promise.all([api.getPost(id), api.getCategories()])
      .then(([postRes, categoriesRes]) => {
        const nextPost = postRes.data.post;
        setPost(nextPost);
        setCategories(categoriesRes.data || []);
        setForm({
          medicineName: nextPost.medicineName || '',
          brand: nextPost.brand || '',
          strength: nextPost.strength || '',
          quantity: nextPost.quantity || '',
          price: nextPost.price ?? '',
          expiryDate: nextPost.expiryDate ? nextPost.expiryDate.split('T')[0] : '',
          city: nextPost.city || '',
          category: nextPost.category || '',
          description: nextPost.description || '',
          contactPhone: nextPost.contactPhone || '',
          telegramUsername: nextPost.telegramUsername || '',
        });
      })
      .catch((err) => showToast(err.message, 'error'))
      .finally(() => setLoading(false));
  }, [id, showToast]);

  const isBuyer = post?.type === 'buyer';

  const updateField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFieldErrors({});

    try {
      const payload = {
        ...form,
        price: form.price === '' ? '' : Number(form.price),
      };
      await api.updateAdminPost(id, payload);
      showToast('Post updated successfully');
      navigate(`/posts/${id}`, { replace: true });
    } catch (err) {
      setFieldErrors(err.fieldErrors || {});
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner label="Loading post editor..." />;
  if (!post) return null;

  return (
    <div className="space-y-6">
      <Link
        to={`/posts/${id}`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
      >
        <IconArrowLeft />
        Back to post
      </Link>

      <PageHeader
        title="Edit Post"
        description="Update the listing details, contact information, and marketplace fields for this post."
      />

      <form onSubmit={handleSubmit} className="card space-y-5 p-5 sm:p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Medicine name</label>
            <input
              className={`input-field ${fieldErrors.medicineName ? 'border-red-400 ring-2 ring-red-100' : ''}`}
              value={form.medicineName}
              onChange={(e) => updateField('medicineName', e.target.value)}
              placeholder="e.g. Paracetamol"
            />
            <FieldError message={fieldErrors.medicineName} />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Strength</label>
            <input
              className={`input-field ${fieldErrors.strength ? 'border-red-400 ring-2 ring-red-100' : ''}`}
              value={form.strength}
              onChange={(e) => updateField('strength', e.target.value)}
              placeholder="e.g. 500mg"
            />
            <FieldError message={fieldErrors.strength} />
          </div>

          {!isBuyer && (
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Brand</label>
              <input
                className={`input-field ${fieldErrors.brand ? 'border-red-400 ring-2 ring-red-100' : ''}`}
                value={form.brand}
                onChange={(e) => updateField('brand', e.target.value)}
                placeholder="e.g. GSK"
              />
              <FieldError message={fieldErrors.brand} />
            </div>
          )}

          {!isBuyer && (
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Category</label>
              <select
                className={`input-field ${fieldErrors.category ? 'border-red-400 ring-2 ring-red-100' : ''}`}
                value={form.category}
                onChange={(e) => updateField('category', e.target.value)}
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
              <FieldError message={fieldErrors.category} />
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Quantity</label>
            <input
              className={`input-field ${fieldErrors.quantity ? 'border-red-400 ring-2 ring-red-100' : ''}`}
              value={form.quantity}
              onChange={(e) => updateField('quantity', e.target.value)}
              placeholder="e.g. 50 Boxes"
            />
            <FieldError message={fieldErrors.quantity} />
          </div>

          {!isBuyer && (
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Price (ETB)</label>
              <input
                type="number"
                min="1"
                step="0.01"
                className={`input-field ${fieldErrors.price ? 'border-red-400 ring-2 ring-red-100' : ''}`}
                value={form.price}
                onChange={(e) => updateField('price', e.target.value)}
                placeholder="e.g. 250"
              />
              <FieldError message={fieldErrors.price} />
            </div>
          )}

          {!isBuyer && (
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Expiry date</label>
              <input
                type="date"
                className="input-field"
                value={form.expiryDate}
                onChange={(e) => updateField('expiryDate', e.target.value)}
              />
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">City</label>
            <select
              className={`input-field ${fieldErrors.city ? 'border-red-400 ring-2 ring-red-100' : ''}`}
              value={form.city}
              onChange={(e) => updateField('city', e.target.value)}
            >
              <option value="">Select city</option>
              {CITIES.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
            <FieldError message={fieldErrors.city} />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Phone</label>
            <input
              className={`input-field ${fieldErrors.contactPhone ? 'border-red-400 ring-2 ring-red-100' : ''}`}
              value={form.contactPhone}
              onChange={(e) => updateField('contactPhone', e.target.value)}
              placeholder="0911234567"
            />
            <FieldError message={fieldErrors.contactPhone} />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Telegram username</label>
            <input
              className="input-field"
              value={form.telegramUsername}
              onChange={(e) => updateField('telegramUsername', e.target.value)}
              placeholder="@username"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">Description</label>
          <textarea
            className="input-field min-h-28 resize-y"
            value={form.description}
            onChange={(e) => updateField('description', e.target.value)}
            placeholder="Additional details..."
          />
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
          <Link to={`/posts/${id}`} className="btn-secondary">
            Cancel
          </Link>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
