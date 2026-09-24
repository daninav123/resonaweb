/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  safelist: [
    // Clases dinámicas generadas por AdminLayout según color del rol
    { pattern: /^bg-(red|purple|blue|orange|green|yellow|gray)-(500|600)\/20$/ },
    { pattern: /^text-(red|purple|blue|orange|green|yellow|gray)-(300|400)$/ },
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.5rem',
        lg: '2rem',
      },
    },
    extend: {
      colors: {
        primary: {
          50:  '#EBEEFF',
          100: '#D1D8FF',
          200: '#A9B6FF',
          300: '#7B8FFE',
          400: '#5D75FE',
          500: '#3D5AFE',
          600: '#1134FE',
          700: '#0123DF',
          800: '#011BB2',
          900: '#01147F',
        },
        resona: {
          DEFAULT: '#3D5AFE',
          light: '#5D75FE',
          dark: '#1134FE',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
