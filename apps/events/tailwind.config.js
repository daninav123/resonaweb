/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1.25rem',
        sm: '1.5rem',
        lg: '2rem',
        xl: '2.5rem',
        '2xl': '3rem',
      },
    },
    extend: {
      colors: {
        ink: {
          DEFAULT: '#0b0b0c',
          900: '#0b0b0c',
          800: '#161617',
          700: '#262628',
          600: '#3a3a3c',
          500: '#6b6b6f',
          400: '#9a9a9e',
          300: '#c4c4c7',
          200: '#dedee1',
          100: '#ececee',
        },
        cream: {
          DEFAULT: '#f4efe6',
          50:  '#fbf9f4',
          100: '#f7f3eb',
          200: '#f4efe6',
          300: '#ece4d3',
          400: '#ddd1b9',
        },
        accent: {
          DEFAULT: '#b8845a',
          50:  '#faf4ee',
          100: '#f1e3d2',
          200: '#e3c7a5',
          300: '#d2a679',
          400: '#c28f5f',
          500: '#b8845a',
          600: '#9a6c47',
          700: '#7b5539',
          800: '#5e402b',
          900: '#402c1d',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
      },
      fontSize: {
        'display-xs': ['clamp(2.25rem, 5vw, 3rem)', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        'display-sm': ['clamp(2.75rem, 6vw, 4rem)',  { lineHeight: '1.02', letterSpacing: '-0.025em' }],
        'display-md': ['clamp(3.5rem, 8vw, 5.5rem)', { lineHeight: '1',    letterSpacing: '-0.03em' }],
        'display-lg': ['clamp(4rem, 10vw, 7.5rem)',  { lineHeight: '0.95', letterSpacing: '-0.035em' }],
        'display-xl': ['clamp(5rem, 13vw, 11rem)',   { lineHeight: '0.92', letterSpacing: '-0.04em' }],
      },
      letterSpacing: {
        tightest: '-0.04em',
        tighter: '-0.03em',
        widest2: '0.2em',
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-out both',
        'rise': 'rise 0.9s cubic-bezier(0.22, 1, 0.36, 1) both',
        'marquee': 'marquee 40s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        rise: {
          '0%': { transform: 'translateY(32px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
