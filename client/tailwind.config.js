/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tavern: {
          darkest: '#0e0704',
          wood: '#1a0f0a',
          umber: '#2b1810',
          amber: '#8a4b1e',
          gold: '#d4a574',
          glow: '#f0c987',
          parchment: '#ede0c8',
          parchmentDark: '#d8c7a7',
          crimson: '#8a1c14',
          moss: '#2d472c',
          arcane: '#4d2d73',
        }
      },
      fontFamily: {
        display: ['Cinzel', 'MedievalSharp', 'Georgia', 'serif'],
        body: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        handwriting: ['"Caveat"', 'cursive']
      },
      boxShadow: {
        'candle': '0 0 25px rgba(240, 201, 135, 0.25)',
        'candle-lg': '0 0 45px rgba(240, 201, 135, 0.4)',
        'ember': '0 0 15px rgba(212, 165, 116, 0.35)',
        'parchment': '0 10px 30px rgba(0, 0, 0, 0.8), inset 0 0 40px rgba(138, 75, 30, 0.15)'
      },
      keyframes: {
        flicker: {
          '0%, 100%': { opacity: '1', filter: 'drop-shadow(0 0 15px rgba(240,201,135,0.4))' },
          '25%': { opacity: '0.88', filter: 'drop-shadow(0 0 10px rgba(240,201,135,0.3))' },
          '50%': { opacity: '0.96', filter: 'drop-shadow(0 0 18px rgba(240,201,135,0.5))' },
          '75%': { opacity: '0.90', filter: 'drop-shadow(0 0 12px rgba(240,201,135,0.35))' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' }
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.85' }
        }
      },
      animation: {
        'flicker': 'flicker 3s ease-in-out infinite',
        'float': 'float 4s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2.5s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
