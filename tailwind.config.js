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
        pry: '#FF6B00', 
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