/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#060816',
          card: '#111827',
          cyan: '#06b6d4',
          purple: '#a855f7',
          blue: '#3b82f6',
          darker: '#0a0d1d',
          border: '#1f2937',
        }
      },
      boxShadow: {
        'glow-cyan': '0 0 15px rgba(6, 182, 212, 0.3)',
        'glow-purple': '0 0 15px rgba(168, 85, 247, 0.3)',
        'glow-blue': '0 0 15px rgba(59, 130, 246, 0.3)',
      }
    },
  },
  plugins: [],
}
