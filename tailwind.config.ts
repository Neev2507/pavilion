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
        canvas: '#0f0a06',
        'surface-1': '#18110a',
        'surface-2': '#22180f',
        'surface-3': '#2d1e12',
        'border-1': '#2d1e12',
        'border-2': '#3a2817',
        accent: '#d4a359',
        'accent-hover': '#e6b76c',
        'accent-high': '#f5c87a',
        'accent-muted': '#996e33',
        'text-primary': '#f7f1e5',
        'text-bright': '#faf6ee',
        'text-secondary': '#a89b88',
        'text-dim': '#8c7f6e',
        'signal-red': '#b84234',
        'signal-green': '#3e8257',
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        serif: ['EB Garamond', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      keyframes: {
        'pulse-fast': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
      },
      animation: {
        'pulse-fast': 'pulse-fast 1s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
export default config
