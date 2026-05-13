/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Syne', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        bg:      '#070b12',
        surface: '#0f1724',
        card:    '#141e2e',
        border:  '#1e2d45',
        border2: '#2a3d5a',
        text:    '#dde4f0',
        muted:   '#6b7e99',
        accent:  '#3b82f6',
        accent2: '#2563eb',
        green:   '#22c55e',
        red:     '#ef4444',
        amber:   '#f59e0b',
        purple:  '#a855f7',
        cyan:    '#06b6d4',
      },
      animation: {
        'fade-up':    'fadeUp 0.4s ease forwards',
        'fade-in':    'fadeIn 0.3s ease forwards',
        'slide-in':   'slideIn 0.3s ease forwards',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeUp:  { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        fadeIn:  { from: { opacity: 0 },                                 to: { opacity: 1 } },
        slideIn: { from: { transform: 'translateX(-16px)', opacity: 0 }, to: { transform: 'translateX(0)', opacity: 1 } },
      },
      backgroundImage: {
        'grid-dark': "url(\"data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0z' fill='none'/%3E%3Cpath d='M0 0v40M40 0v40M0 0h40M0 40h40' stroke='%231e2d45' stroke-width='0.5'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
}
