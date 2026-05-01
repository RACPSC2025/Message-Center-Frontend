/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx,html,js}', './public/**/*.{js,jsx,ts,tsx,html,js}'],
  theme: {
    extend: {
      colors: {
        navy: {
          800: '#000e16',
          700: '#001828',
          600: '#002236'
        },
        primary: '#00bcd4'
      }
    }
  },
  plugins: [require('@tailwindcss/forms')]
};
