import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { useTelegram } from '../context/TelegramContext';

export default function Payment() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { telegramId, haptic } = useTelegram();
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getPaymentInfo().then((res) => setPaymentInfo(res.data));
  }, []);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please upload payment screenshot');
      return;
    }

    setLoading(true);
    setError('');
    haptic('medium');

    try {
      const formData = new FormData();
      formData.append('screenshot', file);
      formData.append('postId', postId);
      formData.append('telegramId', telegramId);

      await api.uploadPayment(formData);
      haptic('success');
      setSubmitted(true);
    } catch (err) {
      setError(err.message);
      haptic('error');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-xl px-4 pb-20 pt-10 text-center">
        <div className="mb-4 text-6xl">⏳</div>
        <h1 className="mb-4 text-2xl font-bold">Waiting for Approval</h1>
        <p className="mb-6 text-tg-hint">
          Your payment screenshot has been submitted. An admin will review your post shortly.
          You will receive a notification via the bot once approved.
        </p>
        <button
          onClick={() => navigate('/my-posts')}
          className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white active:opacity-80"
        >
          View My Posts
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 pb-20 pt-4">
      <h1 className="mb-4 text-2xl font-bold">💳 Payment</h1>

      {paymentInfo && (
        <div className="mb-4 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 p-5 text-white">
          <h3 className="mb-3 font-semibold">Pay ETB {paymentInfo.amount}</h3>
          <div className="mb-2 rounded-lg bg-white/15 p-3">
            <strong className="mb-1 block text-xs opacity-90">CBE Account Number</strong>
            <span className="text-lg font-semibold tracking-wide">{paymentInfo.cbeAccountNumber}</span>
          </div>
          <div className="rounded-lg bg-white/15 p-3">
            <strong className="mb-1 block text-xs opacity-90">Telebirr Phone</strong>
            <span className="text-lg font-semibold tracking-wide">{paymentInfo.telebirrPhone}</span>
          </div>
        </div>
      )}

      <p className="mb-4 text-tg-hint">
        After making the payment, upload your screenshot below.
      </p>

      <form onSubmit={handleSubmit}>
        <label className="block cursor-pointer rounded-xl border-2 border-dashed border-gray-200 p-6 text-center transition-colors hover:border-blue-500">
          <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          {preview ? (
            <img src={preview} alt="Payment preview" className="mx-auto mt-0 max-w-full rounded-xl" />
          ) : (
            <>
              <div className="mb-2 text-4xl">📷</div>
              <p>Tap to upload payment screenshot</p>
            </>
          )}
        </label>

        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading || !file}
          className="mt-5 w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white active:opacity-80 disabled:opacity-50"
        >
          {loading ? 'Uploading...' : 'Submit Payment'}
        </button>
      </form>
    </div>
  );
}
