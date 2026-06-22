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
          50: '#f0f9ff',
          100: '#e0f3ff',
          200: '#bae6ff',
          300: '#7dd3ff',
          400: '#38bfff',
          500: '#5ebbff',
          600: '#0ea5e9',
          700: '#0284c7',
          800: '#0369a1',
          900: '#075985',
        },
        resona: {
          DEFAULT: '#5ebbff',
          light: '#7dd3ff',
          dark: '#0ea5e9',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
