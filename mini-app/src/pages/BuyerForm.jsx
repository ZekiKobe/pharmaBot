import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useTelegram } from '../context/TelegramContext';
import { IconArrowLeft } from '../components/Icons';
import FieldError, { ErrorSummary } from '../components/FieldError';
import { fieldClass, getFieldError } from '../utils/apiError';

const CITIES = ['Addis Ababa', 'Adama', 'Bahir Dar', 'Dire Dawa', 'Hawassa', 'Mekelle', 'Gondar', 'Jimma', 'Dessie', 'Harar'];

export default function BuyerForm() {
  const navigate = useNavigate();
  const { user, telegramId, haptic } = useTelegram();
  const [loading, setLoading] = useState(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setFieldErrors({});
    haptic('medium');

    if (!telegramId) {
      setError('Telegram user ID is missing — please open this app from Telegram.');
      setLoading(false);
      return;
    }

    try {
      const res = await api.createBuyerPost({
        ...form,
        telegramId,
        fullName: [user?.first_name, user?.last_name].filter(Boolean).join(' '),
      });
      haptic('success');
      navigate(`/payment/${res.data._id}`);
    } catch (err) {
      haptic('error');
      setError(err.message || 'Something went wrong');
      setFieldErrors(err.fieldErrors || {});
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-1 text-sm font-medium text-slate-500">
        <IconArrowLeft className="h-4 w-4" /> Back
      </button>
      <h1 className="text-xl font-bold text-slate-900">Buyer Request</h1>
      <p className="mt-1 text-sm text-slate-500">Post your medicine need for ETB 20</p>

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
          {loading ? 'Submitting...' : 'Continue to Payment'}
        </button>
      </form>
    </div>
  );
}
