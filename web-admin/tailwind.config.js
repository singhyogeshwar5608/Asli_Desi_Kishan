import defaultTheme from 'tailwindcss/defaultTheme';

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', ...defaultTheme.fontFamily.sans],
        sans: ['"General Sans"', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        primary: '#6366F1',
        accent: '#10B981',
        base: '#0F172A',
      },
      boxShadow: {
        card: '0 15px 35px rgba(15, 23, 42, 0.15)',
      },
    },
  },
  plugins: [],
};
