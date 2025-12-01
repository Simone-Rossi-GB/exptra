/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0f',
        surface: '#1a1a24',
        'surface-light': '#24243a',
        primary: {
          DEFAULT: '#7c3aed',
          light: '#a855f7',
          dark: '#6b21a8',
        },
        accent: {
          purple: '#a855f7',
          pink: '#d946ef',
          yellow: '#FBBF24',
          green: '#10B981',
          cyan: '#06B6D4',
          orange: '#F97316',
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
        'gradient-success': 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
        'gradient-warning': 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)',
        'gradient-purple': 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
        'gradient-card': 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
        'gradient-blue': 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%)',
      },
      boxShadow: {
        'glow': '0 0 30px rgba(124, 58, 237, 0.3)',
        'glow-purple': '0 0 30px rgba(168, 85, 247, 0.3)',
        'card': '0 4px 20px rgba(0, 0, 0, 0.3)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
