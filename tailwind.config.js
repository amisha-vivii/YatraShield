export default {content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      colors: {
        canvas: '#F7F8FA',
        surface: '#FFFFFF',
        navy: {
          DEFAULT: '#0F2742',
          900: '#0A1B2E',
          700: '#173A61',
          500: '#1E5EA8',
          100: '#E6EDF6',
        },
        charcoal: {
          DEFAULT: '#2B3440',
          600: '#4A5563',
          400: '#7A8494',
        },
        line: '#E2E6EC',
        good: { DEFAULT: '#157F4A', soft: '#E8F4ED' },
        warn: { DEFAULT: '#B7791F', soft: '#FBF3E2' },
        alert: { DEFAULT: '#C2410C', soft: '#FDEDE4' },
        crit: { DEFAULT: '#B42318', soft: '#FCEAE8' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(15, 39, 66, 0.04), 0 1px 8px rgba(15, 39, 66, 0.04)',
        pop: '0 8px 28px rgba(15, 39, 66, 0.12)',
      },
    },
  },
}
