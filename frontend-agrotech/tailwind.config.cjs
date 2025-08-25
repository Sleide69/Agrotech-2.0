/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts}'],
  theme: {
    extend: {
      colors: {
        glass: 'rgba(255,255,255,0.15)'
      },
      backdropBlur: {
        xs: '2px'
      }
    },
  },
  plugins: [],
}
