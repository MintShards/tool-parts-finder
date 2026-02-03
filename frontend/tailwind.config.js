/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        scarlet: {
          DEFAULT: '#DC143C',
          hover: '#B01030',
          light: '#FF6B86',
        },
      },
    },
  },
  plugins: [],
}
