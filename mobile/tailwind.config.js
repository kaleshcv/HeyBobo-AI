/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        surface: '#ffffff',
        background: '#f8fafc',
        muted: '#94a3b8',
        border: '#e2e8f0',
        destructive: '#ef4444',
        success: '#22c55e',
        warning: '#f59e0b',
      },
      fontFamily: {
        sans:   ['Inter_400Regular', 'System'],
        medium: ['Inter_500Medium', 'System'],
        semibold:['Inter_600SemiBold', 'System'],
        bold:   ['Inter_700Bold', 'System'],
      },
    },
  },
  plugins: [],
}
