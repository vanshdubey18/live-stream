import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        bebas: ['var(--font-bebas)', 'sans-serif'],
        inter: ['var(--font-inter)', 'sans-serif'],
      },
      colors: {
        black: '#000000',
        crimson: '#C41E3A',
        's1': '#0d0d0d',
        's2': '#141414',
        's3': '#1a1a1a',
        'border': '#1f1f1f',
        'border-hover': '#2a2a2a',
        'border-active': '#333333',
        'text-secondary': '#888888',
        'text-muted': '#555555',
      },
      letterSpacing: {
        'display': '1px',
        'label': '4px',
        'btn': '3px',
        'tag': '2px',
      },
      borderRadius: {
        DEFAULT: '4px',
        'sm': '2px',
        'card': '4px',
      },
    },
  },
  plugins: [],
};
export default config;
