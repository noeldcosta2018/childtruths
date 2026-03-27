/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['Baloo 2', 'cursive'],
        sans: ['Plus Jakarta Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
