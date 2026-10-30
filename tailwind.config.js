/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Surfaces (deep ink / parchment-at-night palette)
        ink: {
          900: "#0b0d12",
          800: "#11141c",
          700: "#161a24",
          600: "#1d2230",
          500: "#262c3d",
          400: "#333a4f",
        },
        parchment: {
          100: "#f4ecd8",
          200: "#e8dcc0",
          300: "#d8c7a0",
        },
        // Accents
        ember: {
          DEFAULT: "#e07a3f",
          soft: "#f0a877",
          deep: "#b85a24",
        },
        arcane: {
          DEFAULT: "#7c6cf0",
          soft: "#a99bf7",
          deep: "#5a49c7",
        },
        verdant: {
          DEFAULT: "#4fae7a",
          soft: "#7fd0a2",
        },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', "Georgia", "serif"],
        body: ['"Inter"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      boxShadow: {
        glow: "0 0 24px -6px rgba(124,108,240,0.35)",
        panel: "0 8px 30px -12px rgba(0,0,0,0.6)",
      },
    },
  },
  plugins: [],
};
