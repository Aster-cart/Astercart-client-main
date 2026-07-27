/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        plus: ['Plus Jakarta Sans', 'sans-serif'], 
        inter: ['Inter', 'sans-serif'], 
        rob: ['Roobert', 'sans-serif'], 
        mont: ['Montserrat', 'sans-serif'], 
        space: ['"Space Grotesk"', 'sans-serif'],
        mulish: ['Mulish', 'sans-serif'],
      },
      colors: {
        pry: '#FE5B18',
        'pry-light': '#FFF3EE',
        'pry-mid': '#FFD6C2',
        ink: '#1A1A2E',
        body: '#4A4A5A',
        muted: '#8A8A9A',
        'off-white': '#F9F9FB',
        border: '#EBEBF0',
        grey: '#C4C4C4',
        input: '#E0E0E0',
        fade: '#FFE1CC',
        bginput: '#F9FAFB',
        binput: '#F2F2F2',
        blue: '#004EF1',
      },
    },
  },
  plugins: [require('tailwind-scrollbar-hide')],

}