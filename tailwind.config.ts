import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: "#07080a",
          900: "#0c0e14",
          850: "#12151f",
          800: "#181d2a",
          700: "#242a3d",
          600: "#363e59",
        },
        parchment: {
          50: "#fdfbf7",
          100: "#f8f3e6",
          200: "#f0e5cd",
          300: "#e5d2ac",
          400: "#d3b984",
          500: "#be9e60",
          900: "#2a1e0b",
        },
        gold: {
          300: "#f8e3a2",
          400: "#f0ce6b",
          500: "#d4a737",
          600: "#aa8022",
          700: "#7c5c16",
        },
        blood: {
          500: "#bd2828",
          600: "#961c1c",
          700: "#6e1111",
        },
        mana: {
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#1d4ed8",
        },
        arcane: {
          400: "#c084fc",
          500: "#a855f7",
          600: "#7e22ce",
        }
      },
      fontFamily: {
        cinzel: ["Cinzel", "Georgia", "serif"],
        body: ["Plus Jakarta Sans", "Inter", "sans-serif"],
      },
      boxShadow: {
        "gold-glow": "0 0 15px rgba(212, 167, 55, 0.25)",
        "gold-glow-lg": "0 0 30px rgba(212, 167, 55, 0.4)",
        "blood-glow": "0 0 15px rgba(189, 40, 40, 0.35)",
        "parchment-inner": "inset 0 2px 8px rgba(0, 0, 0, 0.15)",
      },
      backgroundImage: {
        "vignette": "radial-gradient(circle at center, transparent 40%, rgba(7, 8, 10, 0.85) 100%)",
      }
    },
  },
  plugins: [],
};
export default config;
