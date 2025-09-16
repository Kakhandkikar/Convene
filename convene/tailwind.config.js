/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Dark theme near-black surfaces inspired by references
        night: {
          900: '#0b0f14',
          800: '#0f131a',
          700: '#151a21',
        },
        // Light theme subtle gray surfaces
        paper: {
          50: '#f8fafc',
          100: '#f2f4f8',
        },
        brand: {
          50: '#f3f0ff',
          100: '#e6dbff',
          400: '#8b5cf6',
          500: '#7c3aed',
          600: '#6d28d9',
        },
        accent: {
          400: '#a855f7',
          500: '#8b5cf6',
          600: '#7c3aed',
        },
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['Manrope', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 8px 30px rgba(0,0,0,0.08)',
        softDark: '0 12px 40px rgba(0,0,0,0.35)',
      },
      borderRadius: {
        xl2: '1rem',
      },
    },
  },
  plugins: [],
}


