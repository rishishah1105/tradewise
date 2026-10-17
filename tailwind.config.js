/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-black': '#000000',
        'brand-dark': '#292C38',
        'brand-card': '#38384A',
        'brand-orange': '#FFAE00',
        'brand-light': '#E2E8F0',
        'brand-muted': '#94A3B8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-subtle': 'bounce 2s infinite',
        'float-xp': 'floatXP 1.5s ease-out forwards',
        'glow-pulse': 'glowPulse 2s infinite alternate',
      },
      keyframes: {
        floatXP: {
          '0%': { opacity: '1', transform: 'translateY(0) scale(1)' },
          '50%': { opacity: '1', transform: 'translateY(-20px) scale(1.1)' },
          '100%': { opacity: '0', transform: 'translateY(-40px) scale(1)' },
        },
        glowPulse: {
          '0%': { boxShadow: '0 0 5px rgba(255, 174, 0, 0.4)' },
          '100%': { boxShadow: '0 0 20px rgba(255, 174, 0, 0.8)' },
        }
      }
    },
  },
  plugins: [],
}
