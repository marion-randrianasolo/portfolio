/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Couleur principale (orange)
        brand: {
          50:  "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316", // par défaut
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
          DEFAULT: "#f97316",
        },
        // Accent (rose – centres d’intérêts)
        accent: {
          50:  "#fff1f7",
          100: "#ffe4ef",
          200: "#fecddc",
          300: "#fba4c4",
          400: "#f472b6",
          500: "#ec4899",
          600: "#db2777",
          700: "#be185d",
          800: "#9d174d",
          900: "#831843",
          DEFAULT: "#ec4899",
        },
      },
      boxShadow: {
        soft: "0 6px 24px rgba(15,23,42,.06)",
      },
      borderRadius: {
        xl2: "1rem",
      },
    },
  },
  plugins: [],
}
