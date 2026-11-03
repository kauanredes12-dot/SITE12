import { fontFamily } from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#FFF7EC',
          100: '#FFF0DF',
          200: '#FFDDB0',
          300: '#FFC47A',
          400: '#FFA640',
          500: '#FF8A00',
          600: '#F07800',
          700: '#C75F00',
          800: '#9A4A00',
          900: '#6B3300',
        },
        ink: {
          900: '#202020',
          500: '#777777',
          200: '#E4E4E4',
          100: '#EFEFEF',
          50: '#FAFAFA',
        },
        error: {
          50: '#FDECEC',
          500: '#D92D20',
          700: '#B42318',
        },
      },
      fontFamily: {
        sans: ['Manrope', ...fontFamily.sans],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(32, 32, 32, 0.04), 0 12px 32px -16px rgba(32, 32, 32, 0.16)',
        lift: '0 2px 4px rgba(32, 32, 32, 0.04), 0 24px 48px -20px rgba(32, 32, 32, 0.22)',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease-out both',
      },
    },
  },
  plugins: [],
};
