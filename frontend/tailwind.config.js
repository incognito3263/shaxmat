/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        surface2: 'var(--surface-2)',
        border: 'var(--border)',
        boardDark: 'var(--board-dark)',
        boardLight: 'var(--board-light)',
        accentWhite: 'var(--accent-white)',
        accentCyan: 'var(--accent-cyan)',
        checkRed: 'var(--check-red)',
        legalBlue: 'var(--legal-blue)',
        selectedGold: 'var(--selected-gold)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'board': '0 20px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04)',
        'piece': '0 4px 12px rgba(0,0,0,0.6)',
        'glow-cyan': '0 0 20px rgba(77,217,232,0.3)',
        'glow-gold': '0 0 20px rgba(245,197,24,0.4)',
        'glow-red': '0 0 20px rgba(255,59,59,0.4)',
      },
      animation: {
        'check-pulse': 'checkPulse 1s ease-in-out infinite',
        'fade-in': 'fadeIn 0.2s ease',
        'scale-in': 'scaleIn 0.2s ease',
      },
      keyframes: {
        checkPulse: {
          '0%, 100%': { boxShadow: 'inset 0 0 0 2px #FF3B3B, 0 0 12px rgba(255,59,59,0.4)' },
          '50%': { boxShadow: 'inset 0 0 0 3px #FF3B3B, 0 0 24px rgba(255,59,59,0.7)' },
        },
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        scaleIn: {
          from: { opacity: 0, transform: 'scale(0.92)' },
          to: { opacity: 1, transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
