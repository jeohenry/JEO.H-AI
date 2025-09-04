/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",          
    "./src/**/*.{js,jsx,ts,tsx}",   // All components and pages
  ],
  theme: {
    extend: {
      colors: {
        // Optional custom color palette
        primary: '#1D4ED8',
        secondary: '#9333EA',
      },
    },
  },
  darkMode: 'class', // Enables dark mode via class strategy (you can toggle it manually)
  plugins: [],
}