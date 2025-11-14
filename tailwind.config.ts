import type { Config } from "tailwindcss";
import animatePlugin from "tailwindcss-animate";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f2f6f9",
          100: "#daf1fa",
          200: "#72bee8",
          300: "#5ca7d1",
          400: "#17426a",
          500: "#0f2438",
        },
      },
      fontFamily: {
        sans: ["Inter", "var(--font-inter)", "system-ui", "sans-serif"],
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        shimmer: "shimmer 2s linear infinite",
      },
    },
  },
  plugins: [animatePlugin],
};

export default config;
