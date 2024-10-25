import type { Config } from "tailwindcss";
import colors from "tailwindcss/colors";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
    colors: {
      black: "#0D0D0D",
      white: "#FCF5ED",
      primary: "#CE5A67",
      secondary: "#F4BF96",
      gray: {
        darker: colors.stone[500],
        DEFAULT: "#A3A3A3",
        lighter: "#e0e6ed",
      },
    },
    fontFamily: {
      sans: ["AvantGarde", "sans-serif"],
      serif: ["Lora", "serif"],
    },
  },
  plugins: [],
} satisfies Config;
