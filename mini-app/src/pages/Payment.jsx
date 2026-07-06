import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { useTelegram } from '../context/TelegramContext';
import { useLanguage } from '../context/LanguageContext';
import { IconArrowLeft } from '../components/Icons';
import FieldError, { ErrorSummary } from '../components/FieldError';
import { getFieldError } from '../utils/apiError';

export default function Payment() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { telegramId, haptic } = useTelegram();
  const { t } = useLanguage();
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => { api.getPaymentInfo().then((res) => setPaymentInfo(res.data)); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    if (!file) {
      const msg = t('payment.screenshotRequired');
      setFieldErrors({ screenshot: msg });
      setError(msg);
      return;
    }

    if (!telegramId) {
      const msg = t('common.telegramIdMissing');
      setError(msg);
      setFieldErrors({ telegramId: msg });
      return;
    }

    setLoading(true);
    haptic('medium');
    try {
      const fd = new FormData();
      fd.append('screenshot', file);
      fd.append('postId', postId);
      fd.append('telegramId', telegramId);
      await api.uploadPayment(fd);
      haptic('success');
      setSubmitted(true);
    } catch (err) {
      haptic('error');
      setError(err.message || t('payment.uploadFailed'));
      setFieldErrors(err.fieldErrors || {});
    } finally {
      setLoading(false);
    }
  };

  const uploadBorder = fieldErrors.screenshot
    ? 'border-red-400'
    : 'border-tg-hint/40';

  if (submitted) {
    return (
      <div className="app-container flex min-h-[60vh] flex-col items-center justify-center text-center">
        <button onClick={() => navigate(-1)} className="mb-4 flex w-full items-center gap-1 self-start text-sm font-medium text-tg-hint">
          <IconArrowLeft className="h-4 w-4" /> {t('common.back')}
        </button>
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/15 text-3xl">⏳</div>
        <h1 className="text-xl font-bold text-tg-text">{t('payment.awaitingTitle')}</h1>
        <p className="mt-2 max-w-xs text-sm text-tg-hint">{t('payment.awaitingMessage')}</p>
        <button onClick={() => navigate('/my-posts')} className="btn-app-primary mt-8 max-w-xs">{t('payment.viewMyPosts')}</button>
      </div>
    );
  }

  return (
    <div className="app-container">
      <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-1 text-sm font-medium text-tg-hint">
        <IconArrowLeft className="h-4 w-4" /> {t('common.back')}
      </button>
      <h1 className="text-xl font-bold text-tg-text">{t('payment.title')}</h1>
      <p className="mt-1 text-sm text-tg-hint">{t('payment.subtitle')}</p>

      {paymentInfo && (
        <div className="mt-6 overflow-hidden rounded-2xl bg-gradient-to-br from-teal-600 to-teal-800 p-5 text-white shadow-lg shadow-teal-600/20">
          <p className="text-sm font-medium text-teal-100">{t('payment.amountToPay')}</p>
          <p className="text-3xl font-extrabold">ETB {paymentInfo.amount}</p>
          <div className="mt-4 space-y-2">
            <div className="rounded-xl bg-white/15 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-teal-200">{t('payment.cbeAccount')}</p>
              <p className="font-mono text-sm font-semibold">{paymentInfo.cbeAccountNumber}</p>
            </div>
            <div className="rounded-xl bg-white/15 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-teal-200">{t('payment.telebirr')}</p>
              <p className="font-mono text-sm font-semibold">{paymentInfo.telebirrPhone}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6">
        <label className={`app-card flex cursor-pointer flex-col items-center border-2 border-dashed p-8 transition-colors ${uploadBorder}`}>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const f = e.target.files[0];
              if (f) {
                setFile(f);
                setPreview(URL.createObjectURL(f));
                setFieldErrors((prev) => { const n = { ...prev }; delete n.screenshot; return n; });
                setError('');
              }
            }}
            className="hidden"
          />
          {preview ? (
            <img src={preview} alt="Preview" className="max-h-48 rounded-xl object-contain" />
          ) : (
            <>
              <div
                className="mb-2 flex h-12 w-12 items-center justify-center rounded-full"
                style={{ backgroundColor: 'color-mix(in srgb, var(--tg-theme-button-color) 15%, var(--tg-theme-secondary-bg-color))', color: 'var(--tg-theme-button-color)' }}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" /></svg>
              </div>
              <p className="text-sm font-semibold text-tg-text">{t('payment.uploadScreenshot')}</p>
              <p className="mt-1 text-xs text-tg-hint">{t('payment.tapToSelect')}</p>
            </>
          )}
        </label>
        <FieldError message={getFieldError(fieldErrors, 'screenshot')} />

        {(error || Object.keys(fieldErrors).length > 0) && (
          <div className="mt-3">
            <ErrorSummary message={error} fieldErrors={fieldErrors} />
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-app-primary mt-5">
          {loading ? t('payment.uploading') : t('payment.submit')}
        </button>
      </form>
    </div>
  );
}
