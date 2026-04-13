import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        charlie: {
          50:  "#fff8f1",
          100: "#ffecd6",
          200: "#ffd4a8",
          300: "#ffb470",
          400: "#ff8c3a",
          500: "#f86c14",
          600: "#e05209",
          700: "#b93d0a",
          800: "#943210",
          900: "#782b10",
          950: "#411306",
        },
      },
    },
  },
  plugins: [],
};
export default config;
