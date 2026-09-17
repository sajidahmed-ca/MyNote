/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#F8FAFC',
        surface: '#FFFFFF',
        hover: '#F1F5F9',
        line: '#E2E8F0',
        ink: {
          DEFAULT: '#0F172A',
          secondary: '#475569',
          muted: '#64748B',
        },
        accent: {
          DEFAULT: '#6366F1',
          hover: '#4F46E5',
          soft: '#E0E7FF',
          strong: '#4338CA',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        mono: [
          '"JetBrains Mono"',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Consolas',
          'monospace',
        ],
      },
      boxShadow: {
        card: '0 4px 12px rgba(0,0,0,0.03)',
        pop: '0 8px 28px rgba(15,23,42,0.10)',
        fab: '0 12px 32px rgba(15,23,42,0.28)',
        float: '0 4px 16px rgba(0,0,0,0.06)',
      },
      letterSpacing: {
        tightest: '-0.02em',
        tight: '-0.01em',
      },
      keyframes: {
        'slide-up': {
          '0%': { opacity: '0', transform: 'translate(-50%, 24px)' },
          '100%': { opacity: '1', transform: 'translate(-50%, 0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'pop-in': {
          '0%': { opacity: '0', transform: 'scale(0.94) translateY(4px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
      },
      animation: {
        'slide-up': 'slide-up 0.24s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in': 'fade-in 0.18s ease-out both',
        'scale-in': 'scale-in 0.16s ease-out both',
        'pop-in': 'pop-in 0.2s cubic-bezier(0.16, 1, 0.3, 1) both',
      },
    },
  },
  plugins: [],
}