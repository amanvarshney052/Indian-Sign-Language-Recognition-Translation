/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sage: {
          50: '#F5F8F0',
          100: '#E8EEDF',
          200: '#D5E2C2', // Primary sage green
          300: '#BFD3A3',
          400: '#A4BF80',
          500: '#84A45B',
          600: '#658241',
          700: '#4D6431',
          800: '#394A25',
          900: '#263219',
        },
        ink: {
          primary: '#252720',   // Primary text
          secondary: '#747873', // Secondary text
          muted: '#9DA29B',
          dark: '#1A1C16',
        },
        pastel: {
          bg: '#F7F8F4',        // Main background
          card: '#FFFFFF',      // Card background
          surface: '#F0F2F3',   // Soft gray section background
          blue: '#B7C8FF',      // Soft blue
          lavender: '#D1B9E8',  // Lavender
          yellow: '#FFE17A',    // Warm yellow
          coral: '#F1B6B9',     // Muted coral
          mint: '#D5E2C2',
        },
        status: {
          successBg: '#E4F2D8',
          successText: '#21431A',
          warningBg: '#FEF3C7',
          warningText: '#78350F',
          errorBg: '#FEE2E2',
          errorText: '#991B1B',
          infoBg: '#E0EAFF',
          infoText: '#1E3A8A',
        }
      },
      borderRadius: {
        'card': '22px',
        'card-lg': '26px',
        'card-sm': '16px',
        'pill': '9999px',
      },
      boxShadow: {
        'soft': '0 2px 12px -2px rgba(37, 39, 32, 0.05), 0 1px 4px -1px rgba(37, 39, 32, 0.03)',
        'card': '0 8px 30px -4px rgba(37, 39, 32, 0.05), 0 2px 8px -2px rgba(37, 39, 32, 0.03)',
        'float': '0 16px 40px -8px rgba(37, 39, 32, 0.08), 0 4px 12px -2px rgba(37, 39, 32, 0.04)',
        'glow-sage': '0 0 24px -4px rgba(213, 226, 194, 0.6)',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Cabinet Grotesk', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-subtle': 'pulseSubtle 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan': 'scanLine 3s ease-in-out infinite',
      },
      keyframes: {
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        scanLine: {
          '0%': { transform: 'translateY(-100%)' },
          '50%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(-100%)' },
        }
      }
    },
  },
  plugins: [],
}

