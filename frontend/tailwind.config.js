/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontSize: {
        'xxs': '0.5rem',  // 8px
      },
      aspectRatio: {
        'bag_ratio': '1050/700', // bag_ratio cannot be used anywhere else
      },
      boxShadow: {
        'mega': '0 15px 60px -15px rgba(0, 0, 0, 0.5)',
      }
    },
  },
  plugins: [],
}