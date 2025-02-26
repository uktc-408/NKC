/** @type {import('tailwindcss').Config} */
import colors from 'tailwindcss/colors'
import forms from '@tailwindcss/forms'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: colors.cyan,
        secondary: colors.pink,
        accent: colors.emerald,
      },
      keyframes: {
        cyberSlide: {
          '0%, 100%': { transform: 'translateX(-100%)' },
          '50%': { transform: 'translateX(100%)' },
        }
      },
      animation: {
        'cyber-slide': 'cyberSlide 3s ease-in-out infinite',
      }
    },
  },
  corePlugins: {
    backgroundColor: false, // Disable all Tailwind background-color utilities
    backgroundImage: false, // Disable all Tailwind background-image utilities
  },
  plugins: [
    // Configure the forms plugin to use the "class" strategy:
    forms({
      strategy: 'class', // only apply styles when you add a specific class (e.g., .form-input)
    }),
    require('tailwind-scrollbar'),
  ],
}