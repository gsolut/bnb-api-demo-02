/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        crypto: {
          bg: '#0b0e11',
          surface: '#181a20',
          panel: '#1e2329',
          border: '#2b313a',
          hover: '#2a2e39',
          text: '#eaecef',
          muted: '#848e9c',
          green: '#0ecb81',
          red: '#f6465d',
          gold: '#f0b90b',
        }
      }
    },
  },
  plugins: [],
}
