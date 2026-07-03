import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useTelegram } from '../context/TelegramContext';

const ETHIOPIAN_CITIES = [
  'Addis Ababa', 'Adama', 'Bahir Dar', 'Dire Dawa', 'Hawassa',
  'Mekelle', 'Gondar', 'Jimma', 'Dessie', 'Harar',
];

const inputClass =
  'w-full rounded-xl border border-gray-200 bg-tg-card px-3 py-3 text-tg-text focus:border-blue-500 focus:outline-none';
const labelClass = 'mb-1.5 block text-sm font-medium text-tg-hint';

export default function SellerForm() {
  const navigate = useNavigate();
  const { user, telegramId, haptic } = useTelegram();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    medicineName: '',
    brand: '',
    strength: '',
    quantity: '',
    price: '',
    expiryDate: '',
    city: '',
    description: '',
    contactPhone: '',
    telegramUsername: user?.username || '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    haptic('medium');

    try {
      const res = await api.createSellerPost({
        ...form,
        price: parseFloat(form.price),
        telegramId,
        fullName: [user?.first_name, user?.last_name].filter(Boolean).join(' '),
      });
      haptic('success');
      navigate(`/payment/${res.data._id}`);
    } catch (err) {
      setError(err.message);
      haptic('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl px-4 pb-20 pt-4">
      <h1 className="mb-4 text-2xl font-bold">💊 Seller Listing</h1>
      <p className="mb-5 text-tg-hint">
        List your medicine for sale. Posting fee: ETB 20.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className={labelClass}>Medicine Name *</label>
          <input
            name="medicineName"
            value={form.medicineName}
            onChange={handleChange}
            required
            className={inputClass}
          />
        </div>

        <div className="mb-4 grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Brand *</label>
            <input name="brand" value={form.brand} onChange={handleChange} required className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Strength *</label>
            <input
              name="strength"
              value={form.strength}
              onChange={handleChange}
              required
              placeholder="500mg"
              className={inputClass}
            />
          </div>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Quantity *</label>
            <input
              name="quantity"
              value={form.quantity}
              onChange={handleChange}
              required
              placeholder="100 Boxes"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Price (ETB) *</label>
            <input
              name="price"
              type="number"
              value={form.price}
              onChange={handleChange}
              required
              min="1"
              className={inputClass}
            />
          </div>
        </div>

        <div className="mb-4">
          <label className={labelClass}>Expiry Date *</label>
          <input
            name="expiryDate"
            type="date"
            value={form.expiryDate}
            onChange={handleChange}
            required
            className={inputClass}
          />
        </div>

        <div className="mb-4">
          <label className={labelClass}>City *</label>
          <select name="city" value={form.city} onChange={handleChange} required className={inputClass}>
            <option value="">Select city</option>
            {ETHIOPIAN_CITIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className={labelClass}>Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className={`${inputClass} min-h-20 resize-y`}
          />
        </div>

        <div className="mb-4">
          <label className={labelClass}>Contact Phone *</label>
          <input
            name="contactPhone"
            value={form.contactPhone}
            onChange={handleChange}
            required
            type="tel"
            className={inputClass}
          />
        </div>

        <div className="mb-4">
          <label className={labelClass}>Telegram Username</label>
          <input
            name="telegramUsername"
            value={form.telegramUsername}
            onChange={handleChange}
            className={inputClass}
          />
        </div>

        {error && <p className="mb-3 text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white active:opacity-80 disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Continue to Payment'}
        </button>
      </form>
    </div>
  );
}
