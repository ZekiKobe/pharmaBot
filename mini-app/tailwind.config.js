/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        tg: {
          bg: 'var(--tg-theme-bg-color, #f5f7fa)',
          text: 'var(--tg-theme-text-color, #1a1a2e)',
          hint: 'var(--tg-theme-hint-color, #6b7280)',
          link: 'var(--tg-theme-link-color, #2563eb)',
          card: 'var(--tg-theme-secondary-bg-color, #ffffff)',
          button: 'var(--tg-theme-button-color, #2563eb)',
        },
      },
    },
  },
  plugins: [],
};
