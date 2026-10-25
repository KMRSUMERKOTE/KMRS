/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Primary: indigo built around #3d348b (name kept as "forest" so existing classes still work)
        forest: {
          50: '#f4f3fb',
          100: '#e7e5f6',
          200: '#cfcbed',
          300: '#aca6df',
          400: '#857dcc',
          500: '#6459b3',
          600: '#5249a8',
          700: '#463d9b',
          800: '#3d348b',
          900: '#2d2768',
          950: '#1a1640',
        },
        // Accent: golden yellow (name kept as "ochre")
        ochre: {
          50: '#fdf9ec',
          100: '#faf0cd',
          200: '#f4e09a',
          300: '#ecca5f',
          400: '#e0b232',
          500: '#c99a14',
          600: '#a37a10',
          700: '#7d5d11',
        },
        ivory: '#f8f7fb',
        ink: '#1f1d33',
      },
      fontFamily: {
        serif: ['"Source Serif 4"', 'Georgia', 'serif'],
        sans: ['"Noto Sans"', '"Noto Sans Oriya"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(45, 39, 104, 0.08), 0 2px 8px rgba(45, 39, 104, 0.06)',
      },
    },
  },
  plugins: [],
};