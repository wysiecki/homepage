/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./*.html', './*.js'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"Roboto Mono"', '"SF Mono"', 'monospace'],
      },
      colors: {
        surface: {
          base: '#131313',
          low: '#1C1B1B',
          container: '#20201F',
          high: '#2A2A2A',
          highest: '#353535',
        },
        primary: {
          DEFAULT: '#CABEFF',
          container: '#6951D0',
        },
        secondary: {
          DEFAULT: '#BDF4FF',
          container: '#00E5FF',
        },
        tertiary: {
          DEFAULT: '#FFABEF',
          container: '#D051C4',
        },
        on: {
          surface: '#E5E2E1',
          primary: '#1C1B1B',
        },
        outline: {
          DEFAULT: '#938E9F',
          variant: '#484553',
        },
      },
      borderRadius: {
        cyber: '0.25rem',
      },
      animation: {
        'reveal-up': 'revealUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'reveal-down': 'revealDown 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in': 'fadeIn 0.8s ease forwards',
        'slide-in': 'slideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        blink: 'blink 1s step-end infinite',
        grain: 'grain 8s steps(10) infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
      },
      keyframes: {
        revealUp: {
          '0%': { opacity: '0', transform: 'translateY(40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        revealDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        grain: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '10%': { transform: 'translate(-5%, -10%)' },
          '20%': { transform: 'translate(-15%, 5%)' },
          '30%': { transform: 'translate(7%, -25%)' },
          '40%': { transform: 'translate(-5%, 25%)' },
          '50%': { transform: 'translate(-15%, 10%)' },
          '60%': { transform: 'translate(15%, 0%)' },
          '70%': { transform: 'translate(0%, 15%)' },
          '80%': { transform: 'translate(3%, 35%)' },
          '90%': { transform: 'translate(-10%, 10%)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
