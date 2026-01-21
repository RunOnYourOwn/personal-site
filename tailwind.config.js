/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Satoshi', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        // Single accent color with HSB-based variations
        accent: {
          50: '#f0f5ff', // Lightest - backgrounds
          100: '#e0ebff', // Light - hover backgrounds
          200: '#c7d9ff', // Subtle borders
          400: '#6b9fff', // Lighter accent
          500: '#3b82f6', // Base blue
          600: '#2563eb', // Hover state
          700: '#1d4ed8', // Active/pressed
          900: '#1e3a8a', // Darkest
        },
      },
    },
  },
};
