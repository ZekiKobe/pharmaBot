/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#eef9f6',
          100: '#d5f0e8',
          200: '#aee1d2',
          300: '#7ccbb6',
          400: '#4aaf97',
          500: '#2d947d',
          600: '#227764',
          700: '#1d5f52',
          800: '#1a4c43',
          900: '#173f38',
          950: '#0b2420',
        },
        surface: {
          DEFAULT: '#ffffff',
          muted: '#f8fafc',
          border: '#e2e8f0',
        },
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        elevated: '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
        sidebar: '4px 0 24px -4px rgb(0 0 0 / 0.08)',
      },
    },
  },
  plugins: [],
};
