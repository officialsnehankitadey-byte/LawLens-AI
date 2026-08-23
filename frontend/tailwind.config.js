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
          DEFAULT: "var(--bg-base)",
          50:  "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B",
          600: "#475569",
          700: "#334155",
          800: "#1E293B",
          900: "var(--bg-base)",
          950: "var(--bg-base-950)",
        },
        // Primary brand accent
        brand: {
          DEFAULT: "rgb(var(--brand-rgb) / <alpha-value>)",
          light: "var(--brand-light)",
          dark:  "var(--brand-dark)",
          muted: "var(--brand-muted)",
        },
        // Surface layers
        surface: {
          DEFAULT: "var(--bg-surface)",
          raised:  "var(--bg-surface-raised)",
          overlay: "var(--bg-surface-overlay)",
          border:  "var(--border-color)",
          borderHover: "var(--border-color-hover)",
        },
        // Text hierarchy
        text: {
          primary:   "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted:     "var(--text-muted)",
          inverse:   "var(--text-inverse)",
        },
        // Semantic states
        success: {
          DEFAULT: "var(--success-text)",
          muted:   "var(--success-muted)",
          border:  "var(--success-border)",
          text:    "var(--success-text)",
        },
        warning: {
          DEFAULT: "var(--warning-text)",
          muted:   "var(--warning-muted)",
          border:  "var(--warning-border)",
          text:    "var(--warning-text)",
        },
        danger: {
          DEFAULT: "var(--danger-text)",
          muted:   "var(--danger-muted)",
          border:  "var(--danger-border)",
          text:    "var(--danger-text)",
        },
        info: {
          DEFAULT: "var(--info-text)",
          muted:   "var(--info-muted)",
          border:  "var(--info-border)",
          text:    "var(--info-text)",
        },
        // Legacy compatibility
        primary: {
          DEFAULT: "var(--brand)",
          foreground: "var(--text-inverse)",
          hover: "var(--brand-light)",
        },
        secondary: {
          DEFAULT: "var(--bg-surface-raised)",
          foreground: "var(--text-primary)",
        },
        accent: {
          DEFAULT: "var(--brand)",
          foreground: "var(--text-inverse)",
        },
        muted: {
          DEFAULT: "var(--bg-surface-raised)",
          foreground: "var(--text-muted)",
        },
        border: "var(--border-color)",
        input:  "var(--bg-surface)",
        ring:   "var(--brand)",
        background: "var(--bg-base)",
        foreground:  "var(--text-primary)",
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
