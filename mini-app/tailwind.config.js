/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        tg: {
          bg: 'var(--tg-theme-bg-color, #f4f7f6)',
          text: 'var(--tg-theme-text-color, #0f172a)',
          hint: 'var(--tg-theme-hint-color, #64748b)',
          link: 'var(--tg-theme-link-color, #2dd4bf)',
          card: 'var(--tg-theme-secondary-bg-color, #ffffff)',
          button: 'var(--tg-theme-button-color, #0d9488)',
          'button-text': 'var(--tg-theme-button-text-color, #ffffff)',
        },
      },
    },
  },
  plugins: [],
};
