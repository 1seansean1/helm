/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        display: ["Fraunces", "Georgia", "serif"],
        mono: [
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "monospace",
        ],
      },
      colors: {
        // Banking-confident palette: deep navy + warm amber accent + paper warm-white
        ink: {
          950: "#080b12",
          900: "#0b0f17",
          800: "#11161f",
          700: "#1a212c",
          600: "#283040",
          500: "#3a4356",
          400: "#5b647a",
          300: "#8b94a8",
          200: "#c3c9d5",
          100: "#e6e9ef",
          50: "#f4f5f8",
        },
        paper: {
          DEFAULT: "#f7f4ee",
          warm: "#efeae0",
        },
        gold: {
          50: "#fdf8ec",
          100: "#faecc4",
          200: "#f4d889",
          300: "#ecbf52",
          400: "#e3a930",
          500: "#c98a1c",
          600: "#a36b15",
          700: "#7b4f10",
        },
        moss: {
          400: "#7aa37a",
          500: "#4f8e5a",
          600: "#3a6d45",
        },
        rust: {
          400: "#d27a5a",
          500: "#b85a3c",
          600: "#8e4127",
        },
      },
      boxShadow: {
        soft: "0 1px 2px rgba(8,11,18,0.06), 0 8px 24px -12px rgba(8,11,18,0.18)",
        glow: "0 0 0 1px rgba(227,169,48,0.35), 0 8px 32px -8px rgba(227,169,48,0.35)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
