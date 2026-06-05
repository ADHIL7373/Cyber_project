/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'lab-red':    '#E24B4A',
        'lab-green':  '#1D9E75',
        'lab-amber':  '#EF9F27',
        'lab-purple': '#7F77DD',
        'lab-dark':   '#1a1a2e',
        'lab-darker': '#16213e',
        'lab-card':   '#0f3460',
      }
    },
  },
  plugins: [],
}