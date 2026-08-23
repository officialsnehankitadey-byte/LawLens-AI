/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Base surfaces
        base: {
          DEFAULT: "#0C0C0C",
          50:  "#F0EDE8",
          100: "#D8D4CE",
          200: "#A8A49E",
          300: "#78746E",
          400: "#48443E",
          500: "#2A2826",
          600: "#1E1C1A",
          700: "#161412",
          800: "#111110",
          900: "#0C0C0C",
          950: "#080808",
        },
        // Primary brand accent — warm yellow
        brand: {
          DEFAULT: "#F5C418",
          light: "#FFD84D",
          dark:  "#C99E0A",
          muted: "#F5C41820",
        },
        // Surface layers
        surface: {
          DEFAULT: "#141414",
          raised:  "#1A1A1A",
          overlay: "#202020",
          border:  "#2A2A2A",
          borderHover: "#3A3A3A",
        },
        // Text hierarchy
        text: {
          primary:   "#F0EDE8",
          secondary: "#A09C97",
          muted:     "#6A6660",
          inverse:   "#0C0C0C",
        },
        // Semantic states
        success: {
          DEFAULT: "#4ADE80",
          muted:   "#4ADE8015",
          border:  "#166534",
          text:    "#86EFAC",
        },
        warning: {
          DEFAULT: "#F59E0B",
          muted:   "#F59E0B15",
          border:  "#92400E",
          text:    "#FCD34D",
        },
        danger: {
          DEFAULT: "#F87171",
          muted:   "#F8717115",
          border:  "#991B1B",
          text:    "#FCA5A5",
        },
        info: {
          DEFAULT: "#60A5FA",
          muted:   "#60A5FA15",
          border:  "#1E3A5F",
          text:    "#93C5FD",
        },
        // Legacy compatibility (keep existing Tailwind refs working)
        primary: {
          DEFAULT: "#F5C418",
          foreground: "#0C0C0C",
          hover: "#FFD84D",
        },
        secondary: {
          DEFAULT: "#1A1A1A",
          foreground: "#F0EDE8",
        },
        accent: {
          DEFAULT: "#F5C418",
          foreground: "#0C0C0C",
        },
        muted: {
          DEFAULT: "#1A1A1A",
          foreground: "#6A6660",
        },
        border: "#2A2A2A",
        input:  "#1A1A1A",
        ring:   "#F5C418",
        background: "#0C0C0C",
        foreground:  "#F0EDE8",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "Consolas", "monospace"],
      },
      borderRadius: {
        none: "0",
        sm:   "2px",
        DEFAULT: "4px",
        md:   "6px",
        lg:   "8px",
        xl:   "12px",
        "2xl": "16px",
        full: "9999px",
      },
      boxShadow: {
        'glow-brand': '0 0 0 1px #F5C41840',
        'glow-sm':    '0 1px 3px 0 rgba(0,0,0,0.4)',
        'panel':      '0 2px 8px 0 rgba(0,0,0,0.5)',
        'panel-lg':   '0 8px 32px 0 rgba(0,0,0,0.6)',
      },
      animation: {
        'spin-slow': 'spin 2s linear infinite',
        'fade-in':   'fadeIn 0.3s ease-out',
        'slide-up':  'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
