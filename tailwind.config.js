/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cp-black':   '#06070b',
        'cp-dark':    '#0d1117',
        'cp-card':    '#111827',
        'cp-border':  '#243041',
        'cp-cyan':    '#6ee7f9',
        'cp-magenta': '#8b5cf6',
        'cp-yellow':  '#F5E642',
        'cp-green':   '#39FF14',
        'cp-text':    '#edf4ff',
        'cp-muted':   '#8b9ab1',
        'cp-surface': '#0f1724',
        'cp-panel':   '#131c2c',
      },
      fontFamily: {
        orbitron: ['Orbitron', 'monospace'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        glass: '0 18px 50px rgba(3, 8, 20, 0.35)',
        panel: '0 8px 30px rgba(8, 15, 30, 0.24)',
        accent: '0 0 0 1px rgba(110, 231, 249, 0.14), 0 12px 30px rgba(11, 39, 53, 0.16)',
      },
      backgroundImage: {
        'cp-grid':
          'linear-gradient(rgba(139,154,177,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(139,154,177,0.05) 1px, transparent 1px)',
        'cp-radial':
          'radial-gradient(circle at top, rgba(110,231,249,0.12), transparent 38%), radial-gradient(circle at 80% 20%, rgba(139,92,246,0.10), transparent 30%)',
      },
      keyframes: {
        glitch: {
          '0%,100%': { clipPath:'inset(0 0 96% 0)', transform:'translate(-1px,0)' },
          '25%':     { clipPath:'inset(38% 0 52% 0)', transform:'translate(1px,0)' },
          '50%':     { clipPath:'inset(78% 0 8% 0)', transform:'translate(-1px,0)' },
          '75%':     { clipPath:'inset(14% 0 70% 0)', transform:'translate(1px,0)' },
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
        glitch:     'glitch 0.45s infinite',
        flicker:    'flicker 4s infinite',
        scanline:   'scanline 8s linear infinite',
        pulse_neon: 'pulse_neon 2s ease-in-out infinite',
        ticker:     'ticker 30s linear infinite',
      }
    }
  },
  plugins: [],
}
