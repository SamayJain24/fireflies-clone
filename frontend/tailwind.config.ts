import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          DEFAULT: '#6366F1',
          light: '#818CF8',
          dark: '#4F46E5',
        },
        surface: {
          DEFAULT: '#141720',
          raised: '#1A1F2E',
          overlay: '#0A0C14',
        },
      },
      animation: {
        'segment-pulse': 'segment-pulse 2s ease-in-out infinite',
      },
      keyframes: {
        'segment-pulse': {
          '0%, 100%': { backgroundColor: 'rgba(99, 102, 241, 0.08)' },
          '50%': { backgroundColor: 'rgba(99, 102, 241, 0.16)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
