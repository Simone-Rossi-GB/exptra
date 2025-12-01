/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0A0E27',
        surface: '#141B34',
        'surface-light': '#1A2342',
        primary: {
          DEFAULT: '#6366F1',
          light: '#818CF8',
          dark: '#4F46E5',
        },
        accent: {
          purple: '#A855F7',
          pink: '#EC4899',
          yellow: '#FBBF24',
          green: '#10B981',
          cyan: '#06B6D4',
          orange: '#F97316',
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
        'gradient-success': 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
        'gradient-warning': 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)',
        'gradient-purple': 'linear-gradient(135deg, #A855F7 0%, #EC4899 100%)',
        'gradient-card': 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
        'gradient-blue': 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%)',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(99, 102, 241, 0.4)',
        'glow-purple': '0 0 20px rgba(168, 85, 247, 0.4)',
        'card': '0 4px 20px rgba(0, 0, 0, 0.25)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
