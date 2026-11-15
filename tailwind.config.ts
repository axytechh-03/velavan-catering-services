import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './data/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          green: {
            DEFAULT: '#0f3d28',
            deep: '#0a2a1b',
            emerald: '#00692d',
            light: '#1b5e3a',
            surface: '#f0f6f2',
            subtle: '#e4eee7',
          },
          gold: {
            DEFAULT: '#c59d3f',
            light: '#e2be67',
            deep: '#9c7b2c',
            warm: '#f3e8c9',
            gradientStart: '#d4af37',
            gradientEnd: '#aa7c11',
          },
          ivory: {
            DEFAULT: '#faf8f2',
            dark: '#f3efe3',
            light: '#ffffff',
          },
        },
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', '-apple-system', 'sans-serif'],
        tamil: ['Noto Sans Tamil', 'Mukta Malar', 'sans-serif'],
      },
      boxShadow: {
        'luxury': '0 20px 40px -15px rgba(10, 42, 27, 0.12)',
        'luxury-hover': '0 25px 50px -12px rgba(10, 42, 27, 0.22)',
        'gold-glow': '0 0 25px rgba(197, 157, 63, 0.25)',
      },
    },
  },
  plugins: [],
}

export default config
