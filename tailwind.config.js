/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cp-black':   '#0A0A0F',
        'cp-dark':    '#12121A',
        'cp-card':    '#1A1A2E',
        'cp-border':  '#2A2A3F',
        'cp-cyan':    '#00F5FF',
        'cp-magenta': '#FF2D78',
        'cp-yellow':  '#F5E642',
        'cp-green':   '#39FF14',
        'cp-text':    '#E0E0FF',
        'cp-muted':   '#6B6B8A',
      },
      fontFamily: {
        orbitron: ['Orbitron', 'monospace'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      keyframes: {
        glitch: {
          '0%,100%': { clipPath:'inset(0 0 98% 0)', transform:'translate(-2px,0)' },
          '25%':     { clipPath:'inset(40% 0 50% 0)', transform:'translate(2px,0)' },
          '50%':     { clipPath:'inset(80% 0 5% 0)', transform:'translate(-1px,0)' },
          '75%':     { clipPath:'inset(10% 0 75% 0)', transform:'translate(1px,0)' },
        },
        flicker: {
          '0%,100%': { opacity:'1' },
          '41%': { opacity:'.97' },
          '42%': { opacity:'.85' },
          '43%': { opacity:'1' },
          '70%': { opacity:'.94' },
          '71%': { opacity:'1' },
        },
        scanline: {
          '0%':   { transform:'translateY(-100%)' },
          '100%': { transform:'translateY(100vh)' },
        },
        pulse_neon: {
          '0%,100%': { boxShadow:'0 0 5px #00F5FF, 0 0 10px #00F5FF' },
          '50%':     { boxShadow:'0 0 20px #00F5FF, 0 0 40px #00F5FF, 0 0 60px #00F5FF' },
        },
        ticker: {
          '0%':   { transform:'translateX(0)' },
          '100%': { transform:'translateX(-50%)' },
        }
      },
      animation: {
        glitch:     'glitch 0.3s infinite',
        flicker:    'flicker 4s infinite',
        scanline:   'scanline 8s linear infinite',
        pulse_neon: 'pulse_neon 2s ease-in-out infinite',
        ticker:     'ticker 30s linear infinite',
      }
    }
  },
  plugins: [],
}
