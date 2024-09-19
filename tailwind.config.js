import { P_COLORS } from './src/constants/colors';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
    colors: {
      ...P_COLORS,
    },
    fontFamily: {
      sans: ['AvantGarde', 'sans-serif'],
      serif: ['Lora', 'serif'],
    },
  },
  plugins: [],
};
