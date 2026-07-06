import { useLanguage } from '../context/LanguageContext';

export default function LanguageToggle({ className = '' }) {
  const { lang, setLang } = useLanguage();

  return (
    <div
      className={`inline-flex rounded-xl p-0.5 ${className}`}
      style={{
        backgroundColor: 'color-mix(in srgb, var(--tg-theme-hint-color) 14%, var(--tg-theme-secondary-bg-color))',
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
              active ? 'shadow-sm' : 'text-tg-hint'
            }`}
            style={
              active
                ? {
                    backgroundColor: 'var(--tg-theme-secondary-bg-color)',
                    color: 'var(--tg-theme-button-color, #0d9488)',
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
