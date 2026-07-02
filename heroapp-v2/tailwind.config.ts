import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Nuvho primary palette
        'nv-blue-slate':    '#28687F',
        'nv-steel-blue':    '#6BA1BF',
        'nv-tropical-teal': '#80B9BF',
        'nv-iron-grey':     '#414B4C',
        'nv-platinum':      '#E9EAEC',
        // Semantic
        'nv-surface-page':  '#F5F8F9',
        'nv-surface-card':  '#ffffff',
        'nv-surface-dark':  '#28687F',
        'nv-surface-darker':'#1E5163',
        // Secondary
        'nv-cherry-rose':   '#982649',
        'nv-tuscan-sun':    '#F3C65D',
        'nv-success':       '#4A8F6E',
      },
      fontFamily: {
        display: ['var(--font-comfortaa)', 'system-ui', 'sans-serif'],
        body:    ['var(--font-raleway)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        pill: '999px',
        card: '14px',
      },
      boxShadow: {
        'nv-sm': '0 2px 8px rgba(40,104,127,0.07)',
        'nv-md': '0 10px 28px rgba(40,104,127,0.09)',
      },
      transitionDuration: { DEFAULT: '220ms' },
    },
  },
  plugins: [],
};

export default config;
