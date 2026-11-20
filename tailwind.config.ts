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
        brand: {
          50: "#fdf8f6",
          100: "#f2e8e5",
          200: "#eaddd7",
          300: "#e0cec7",
          400: "#d2bab0",
          500: "#bc988a",
          600: "#9c7769",
          700: "#7c5a4d",
          800: "#5c4036",
          900: "#422c24",
        },
        coral: {
          50: "#fff5f2",
          100: "#ffe8e0",
          200: "#ffd1c2",
          300: "#ffb099",
          400: "#ff8261",
          500: "#f85b32",
          600: "#e64016",
          700: "#c1310e",
          800: "#9b2b11",
          900: "#7f2814",
        },
      },
      fontFamily: {
        urdu: ["'Noto Nastaliq Urdu'", "'Jameel Noori Nastaleeq'", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
