import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
          active: '#1E40AF',
          light: '#DBEAFE',
        },
        success: {
          DEFAULT: '#16A34A',
          light: '#DCFCE7',
        },
        danger: {
          DEFAULT: '#DC2626',
          light: '#FEF2F2',
        },
        warning: {
          DEFAULT: '#D97706',
          light: '#FEF3C7',
        },
        category: {
          blue: '#2563EB',
          green: '#16A34A',
          purple: '#7C3AED',
          teal: '#0D9488',
          rose: '#E11D48',
          amber: '#D97706',
        },
        sidebar: '#F9FAFB',
      },
      fontFamily: {
        sans: ['Pretendard', 'Noto Sans KR', 'sans-serif'],
      },
      borderRadius: {
        card: '8px',
        badge: '12px',
        input: '6px',
        button: '6px',
      },
      boxShadow: {
        modal: '0 20px 60px rgba(0, 0, 0, 0.15)',
        toast: '0 4px 16px rgba(0, 0, 0, 0.12)',
        card: '0 1px 4px rgba(0, 0, 0, 0.06)',
      },
      animation: {
        'modal-in': 'modal-in 200ms ease-out',
        'toast-in': 'toast-in 200ms ease-out',
        skeleton: 'skeleton-shimmer 1.5s infinite',
        'spin-fast': 'spin 0.6s linear infinite',
      },
      keyframes: {
        'modal-in': {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'toast-in': {
          from: { transform: 'translateX(100%)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
        'skeleton-shimmer': {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
