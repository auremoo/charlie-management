import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "sans-serif",
        ],
      },
      colors: {
        charlie: {
          50: "#fdfaf7",
          100: "#f5efe8",
          200: "#e8ddd0",
          300: "#d4c4ae",
          400: "#c2a88a",
          500: "#b8956e",
          600: "#a07a52",
          700: "#856344",
          800: "#6d503a",
          900: "#5a4232",
          950: "#302119",
        },
      },
    },
  },
  plugins: [],
};
export default config;
