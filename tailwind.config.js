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
        // NOTE: defining `blue` as a single flat string replaced the whole
        // default Tailwind `blue` scale (50–950), which silently killed every
        // `bg-blue-500`, `text-blue-700`, `border-blue-200`, … utility — e.g.
        // the admin Withdrawals "Approve" button (bg-blue-500 text-white) was
        // rendered white-on-white = invisible while "Reject" (bg-red-500) was
        // unaffected. Restore the full scale and keep the brand blue as the
        // DEFAULT for the bare `blue` color.
        blue: {
          DEFAULT: '#004EF1',
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
      },
    },
  },
  plugins: [require('tailwind-scrollbar-hide')],

}