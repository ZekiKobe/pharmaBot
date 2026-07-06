import { useTelegram } from '../context/TelegramContext';
import { useLanguage } from '../context/LanguageContext';
import { IconPhone, IconTelegram } from './Icons';

export default function ContactSection({ telegramUsername, contactPhone }) {
  const { webApp } = useTelegram();
  const { t } = useLanguage();
  const cleanUsername = telegramUsername?.replace(/^@/, '');
  const phoneValue = String(contactPhone || '').trim();
  const phoneHref = `tel:${phoneValue.replace(/[^+\d]/g, '')}`;

  if (!cleanUsername && !phoneValue) return null;

  const openTelegramProfile = (event) => {
    if (!cleanUsername) return;
    if (webApp?.openTelegramLink) {
      event.preventDefault();
      webApp.openTelegramLink(`https://t.me/${cleanUsername}`);
    }
  };

  return (
    <div
      className="mt-6 rounded-xl p-4"
      style={{
        backgroundColor:
          'color-mix(in srgb, var(--tg-theme-button-color) 12%, var(--tg-theme-secondary-bg-color))',
      }}
    >
      <p className="text-[10px] font-bold uppercase text-tg-link">{t('contact.title')}</p>
      <div className="mt-3 space-y-2">
        {cleanUsername && (
          <a
            href={`https://t.me/${cleanUsername}`}
            target="_blank"
            rel="noreferrer"
            onClick={openTelegramProfile}
            className="flex items-center gap-3 rounded-xl px-3 py-3 transition-transform active:scale-[0.99]"
            style={{ backgroundColor: 'var(--tg-theme-secondary-bg-color)' }}
          >
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
              style={{
                backgroundColor:
                  'color-mix(in srgb, var(--tg-theme-link-color, #0f766e) 12%, var(--tg-theme-secondary-bg-color))',
                color: 'var(--tg-theme-link-color, #0f766e)',
              }}
            >
              <IconTelegram className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-tg-hint">{t('contact.telegram')}</p>
              <p className="truncate text-sm font-semibold text-tg-link">@{cleanUsername}</p>
            </div>
          </a>
        )}

        {phoneValue && (
          <a
            href={phoneHref}
            className="flex items-center gap-3 rounded-xl px-3 py-3 transition-transform active:scale-[0.99]"
            style={{ backgroundColor: 'var(--tg-theme-secondary-bg-color)' }}
          >
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
              style={{
                backgroundColor:
                  'color-mix(in srgb, var(--tg-theme-button-color, #0d9488) 12%, var(--tg-theme-secondary-bg-color))',
                color: 'var(--tg-theme-button-color, #0d9488)',
              }}
            >
              <IconPhone className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-tg-hint">{t('contact.phone')}</p>
              <p className="truncate text-sm font-semibold text-tg-text">{phoneValue}</p>
            </div>
          </a>
        )}
      </div>
    </div>
  );
}
