/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#007bff", dark: "#0056b3" },
        secondary: "#6c757d",
        surface: "#f4f7f6",
        ink: "#333333",
        active: "#4caf50",
        paused: "#f44336",
        danger: { DEFAULT: "#dc3545", dark: "#c82333" },
      },
      fontFamily: {
        sans: ['"Segoe UI"', "Tahoma", "Geneva", "Verdana", "sans-serif"],
      },
    },
  },
  plugins: [],
};
