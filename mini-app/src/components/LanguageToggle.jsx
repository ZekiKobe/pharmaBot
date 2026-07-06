import { useLanguage } from '../context/LanguageContext';

export default function LanguageToggle({ className = '', variant = 'default' }) {
  const { lang, setLang } = useLanguage();
  const onDark = variant === 'onDark';

  return (
    <div
      className={`inline-flex shrink-0 rounded-xl p-0.5 ${className}`}
      style={{
        backgroundColor: onDark
          ? 'rgba(255, 255, 255, 0.2)'
          : 'color-mix(in srgb, var(--tg-theme-hint-color) 14%, var(--tg-theme-secondary-bg-color))',
      }}
      role="group"
      aria-label="Language"
    >
      {['en', 'am'].map((code) => {
        const active = lang === code;
        return (
          <button
            key={code}
            type="button"
            onClick={() => setLang(code)}
            className={`min-w-[2.75rem] rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all ${
              active ? 'shadow-sm' : onDark ? 'text-white/70' : 'text-tg-hint'
            }`}
            style={
              active
                ? {
                    backgroundColor: onDark ? '#ffffff' : 'var(--tg-theme-secondary-bg-color)',
                    color: onDark ? 'var(--tg-theme-button-color, #0d9488)' : 'var(--tg-theme-button-color, #0d9488)',
                  }
                : undefined
            }
          >
            {code === 'en' ? 'EN' : 'አማ'}
          </button>
        );
      })}
    </div>
  );
}
