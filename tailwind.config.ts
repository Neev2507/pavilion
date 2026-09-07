import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0a',
        card: '#111111',
        'card-border': '#222222',
        accent: '#00ff87',
        'accent-dim': '#00cc6a',
        'text-primary': '#ffffff',
        'text-secondary': '#888888',
        error: '#ff4444',
        amber: '#ffaa00',
      },
      fontFamily: {
        mono: ['var(--font-geist-mono)', 'ui-monospace', 'monospace'],
      },
      keyframes: {
        'pulse-fast': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        'scale-pop': {
          '0%': { transform: 'scale(1)' },
          '30%': { transform: 'scale(1.12)' },
          '100%': { transform: 'scale(1)' },
        },
        'slide-in-fade': {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'pulse-fast': 'pulse-fast 1s ease-in-out infinite',
        'scale-pop': 'scale-pop 0.3s ease-out',
        'slide-in-fade': 'slide-in-fade 0.25s ease-out',
      },
    },
  },
  plugins: [],
}
export default config
