/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-black': '#090D16',
        'brand-dark': '#1A2232',
        'brand-card': '#131926',
        'brand-orange': '#F59E0B',
        'brand-light': '#F1F5F9',
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
        'badge-spin': 'badgeSpin 1.6s cubic-bezier(0.22, 1, 0.36, 1) forwards',
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
        },
        badgeSpin: {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(1080deg)' },
        },
      }
    },
  },
  plugins: [],
}
