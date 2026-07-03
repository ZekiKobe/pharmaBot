import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useTelegram } from '../context/TelegramContext';
import { IconArrowLeft } from '../components/Icons';

const CITIES = ['Addis Ababa', 'Adama', 'Bahir Dar', 'Dire Dawa', 'Hawassa', 'Mekelle', 'Gondar', 'Jimma', 'Dessie', 'Harar'];

export default function BuyerForm() {
  const navigate = useNavigate();
  const { user, telegramId, haptic } = useTelegram();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    medicineName: '', strength: '', quantity: '', city: '', description: '',
    contactPhone: '', telegramUsername: user?.username || '',
  });

  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    haptic('medium');
    try {
      const res = await api.createBuyerPost({ ...form, telegramId, fullName: [user?.first_name, user?.last_name].filter(Boolean).join(' ') });
      haptic('success');
      navigate(`/payment/${res.data._id}`);
    } catch (err) { setError(err.message); haptic('error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="app-container">
      <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-1 text-sm font-medium text-slate-500">
        <IconArrowLeft className="h-4 w-4" /> Back
      </button>
      <h1 className="text-xl font-bold text-slate-900">Buyer Request</h1>
      <p className="mt-1 text-sm text-slate-500">Post your medicine need for ETB 20</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div><label className="app-label">Medicine Name *</label><input name="medicineName" value={form.medicineName} onChange={set} required className="app-input" placeholder="e.g. Paracetamol" /></div>
        <div><label className="app-label">Strength</label><input name="strength" value={form.strength} onChange={set} className="app-input" placeholder="e.g. 500mg" /></div>
        <div><label className="app-label">Quantity *</label><input name="quantity" value={form.quantity} onChange={set} required className="app-input" placeholder="e.g. 50 Boxes" /></div>
        <div><label className="app-label">City *</label><select name="city" value={form.city} onChange={set} required className="app-input"><option value="">Select city</option>{CITIES.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
        <div><label className="app-label">Description</label><textarea name="description" value={form.description} onChange={set} className="app-input min-h-24 resize-none" placeholder="Additional details..." /></div>
        <div><label className="app-label">Phone *</label><input name="contactPhone" value={form.contactPhone} onChange={set} required type="tel" className="app-input" placeholder="0911XXXXXX" /></div>
        <div><label className="app-label">Telegram Username</label><input name="telegramUsername" value={form.telegramUsername} onChange={set} className="app-input" placeholder="@username" /></div>
        {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={loading} className="btn-app-primary">{loading ? 'Submitting...' : 'Continue to Payment'}</button>
      </form>
    </div>
  );
}
