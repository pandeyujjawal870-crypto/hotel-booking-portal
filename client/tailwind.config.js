/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#12343b',
        coral: '#f97360',
        sand: '#fffaf4',
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        sans: ['DM Sans', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 20px 60px rgba(18, 52, 59, 0.10)',
      },
    },
  },
  plugins: [],
}
