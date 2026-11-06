import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#050D1A",
          900: "#0A1931",
          800: "#0F2547",
          700: "#173766",
          600: "#204A87",
        },
        gold: {
          600: "#B8901F",
          500: "#D4AF37",
          400: "#E6C555",
          300: "#F3DC86",
          100: "#FCF6DF",
        },
      },
    },
  },
  plugins: [],
};
export default config;
