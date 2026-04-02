/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          primary: '#0D1117',
          secondary: '#161B22',
          card: '#21262D',
          hover: '#30363D',
        },
        border: {
          subtle: 'rgba(255,255,255,0.1)',
          hover: 'rgba(255,255,255,0.2)',
        },
        accent: {
          blue: '#58A6FF',
          cyan: '#79C0FF',
          teal: '#39D98A',
          purple: '#A371F7',
          income: '#39D98A',
          expense: '#F85149',
        },
        text: {
          primary: '#F0F6FC',
          secondary: '#8B949E',
          muted: '#6E7681',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Inter', 'SF Pro Display', 'sans-serif'],
      },
      transitionDuration: {
        DEFAULT: '200ms',
      },
    },
  },
  plugins: [],
}