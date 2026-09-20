/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: '#0b0e14',
        cardBg: '#151922',
        borderBg: '#232936',
        wowRed: '#C41E3A',
        goldYellow: '#F59E0B',
        metinPurple: '#9333EA',
        diabloOrange: '#EA580C',
        workBlue: '#2563EB',
        studyEmerald: '#059669'
      }
    },
  },
  plugins: [],
}
