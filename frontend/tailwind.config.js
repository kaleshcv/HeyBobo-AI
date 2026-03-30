/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ── Dubai Gold & Navy (Dark Theme) ──────────────────────────────
        navy: {
          50:  '#e8eef5',
          100: '#c4d1e2',
          200: '#9db2cc',
          300: '#7593b7',
          400: '#537ba6',
          500: '#2D4A6E',
          600: '#1e3a5f',
          700: '#152e4f',
          800: '#0D1B2A',
          900: '#070e17',
        },
        gold: {
          50:  '#fdf8ec',
          100: '#f9edce',
          200: '#f4deab',
          300: '#edcb7d',
          400: '#e5b84e',
          500: '#C9A84C',
          600: '#b08a32',
          700: '#8a6b24',
          800: '#634c18',
          900: '#3d2e0e',
        },
        // ── Dubai Emerald & White (Light Theme) ─────────────────────────
        emerald: {
          50:  '#e6f5ee',
          100: '#c2e6d2',
          200: '#96d5b3',
          300: '#62c28f',
          400: '#2eb371',
          500: '#00A650',
          600: '#00843D',
          700: '#006B32',
          800: '#005227',
          900: '#003018',
        },
        // ── Shared primary (maps to emerald in light, gold in dark via CSS vars) ─
        primary: {
          50:  '#e6f5ee',
          100: '#c2e6d2',
          200: '#96d5b3',
          300: '#62c28f',
          400: '#2eb371',
          500: '#00A650',
          600: '#00843D',
          700: '#006B32',
          800: '#005227',
          900: '#003018',
        },
        success: '#10b981',
        warning: '#f59e0b',
        error:   '#ef4444',
      },
      fontFamily: {
        sans:   ['Cairo', 'Inter', 'sans-serif'],
        arabic: ['Cairo', 'sans-serif'],
        latin:  ['Inter', 'sans-serif'],
      },
      animation: {
        pulse:     'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        shimmer:   'shimmer 2s infinite',
        fadeIn:    'fadeIn 0.4s ease-in-out',
        slideIn:   'slideIn 0.3s ease-out',
        slideUp:   'slideUp 0.4s ease-out',
        goldShine: 'goldShine 3s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%':   { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',     opacity: '1' },
        },
        slideUp: {
          '0%':   { transform: 'translateY(20px)',  opacity: '0' },
          '100%': { transform: 'translateY(0)',     opacity: '1' },
        },
        goldShine: {
          '0%,100%': { opacity: '1' },
          '50%':     { opacity: '0.7' },
        },
      },
      backgroundImage: {
        'dubai-dark':       'linear-gradient(135deg, #0D1B2A 0%, #1A2B3C 50%, #0D1B2A 100%)',
        'dubai-light':      'linear-gradient(135deg, #FFFFFF 0%, #F0FAF5 50%, #FFFFFF 100%)',
        'gold-gradient':    'linear-gradient(135deg, #C9A84C 0%, #E5B84E 50%, #C9A84C 100%)',
        'emerald-gradient': 'linear-gradient(135deg, #00843D 0%, #00A650 50%, #00843D 100%)',
      },
      boxShadow: {
        'gold':        '0 4px 20px rgba(201,168,76,0.25)',
        'gold-lg':     '0 8px 40px rgba(201,168,76,0.35)',
        'nav':         '0 2px 20px rgba(13,27,42,0.15)',
        'card-dark':   '0 4px 24px rgba(0,0,0,0.4)',
        'card-light':  '0 2px 16px rgba(0,132,61,0.08)',
        'emerald':     '0 4px 20px rgba(0,132,61,0.2)',
      },
    },
  },
  plugins: [],
}
