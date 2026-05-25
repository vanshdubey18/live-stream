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
        bg: {
          primary: '#0D0D0D',
          secondary: '#1A1A1A',
          elevated: '#222222',
        },
        border: {
          subtle: '#2A2A2A',
          default: '#333333',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#999999',
          muted: '#555555',
        },
        whoop: {
          green: '#00D4AA',
          red: '#FF3B3B',
          yellow: '#FFD60A',
        },
        white: '#FFFFFF',
        black: '#000000',
      },
      letterSpacing: {
        display: '1px',
        label: '4px',
        btn: '3px',
        tag: '2px',
      },
      borderRadius: {
        DEFAULT: '4px',
        sm: '2px',
        card: '4px',
      },
    },
  },
  plugins: [],
};
export default config;
