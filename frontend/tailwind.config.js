/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primary brand: #44B8DE (medium sky blue)
        primary: {
          50:  '#eef9fd',
          100: '#d6f1fa',
          200: '#a1dbee',   // #A1DBEE — secondary/light
          300: '#6dc8e3',
          400: '#44b8de',   // #44B8DE — primary
          500: '#2a9ec4',
          600: '#1f7fa0',
          700: '#1a6882',
          800: '#175469',
          900: '#124458',
        },
        // Sidebar dark teal (derived from primary, darkened)
        sidebar: {
          DEFAULT: '#0e4f65',
          hover:   '#1a6882',
          active:  '#44b8de',
          border:  '#0a3d50',
          text:    '#a1dbee',
        },
        success: { 100: '#dcfce7', 500: '#22c55e', 700: '#15803d' },
        warning: { 100: '#fef9c3', 500: '#eab308', 700: '#a16207' },
        danger:  { 100: '#fee2e2', 500: '#ef4444', 700: '#b91c1c' },
      },
    },
  },
  plugins: [],
};
