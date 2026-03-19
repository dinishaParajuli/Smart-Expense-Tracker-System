/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#060d1f',
          900: '#0a1428',
          800: '#0f1e3d',
          700: '#152347',
          600: '#1a2d5a',
        },
        card: '#111827',
        cardHover: '#162035',
        accent: {
          blue: '#3b82f6',
          purple: '#8b5cf6',
          emerald: '#10b981',
          amber: '#f59e0b',
          pink: '#ec4899',
        }
      },
      fontFamily: {
        display: ['"Clash Display"', '"Plus Jakarta Sans"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'glow-blue': '0 0 24px rgba(59,130,246,0.25)',
        'glow-purple': '0 0 24px rgba(139,92,246,0.25)',
        'glow-emerald': '0 0 24px rgba(16,185,129,0.20)',
      },
      backgroundImage: {
        'card-gradient': 'linear-gradient(135deg, #111827 0%, #0f172a 100%)',
        'hero-gradient': 'linear-gradient(135deg, #0a1428 0%, #0f1e3d 50%, #0a1428 100%)',
        'blue-gradient': 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
        'emerald-gradient': 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
        'purple-gradient': 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
        'amber-gradient': 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}