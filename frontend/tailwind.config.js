/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F7F9FC",
        surface: {
          DEFAULT: "#FFFFFF",
          muted: "#F1F5F9",
          glass: "rgba(255, 255, 255, 0.75)",
          glassHover: "rgba(255, 255, 255, 0.90)",
          card: "#FFFFFF",
        },
        navy: {
          DEFAULT: "#0B1220",
          dark: "#060A12",
          light: "#1E293B",
          muted: "#526071",
        },
        brand: {
          teal: "#0F766E",      // primary accent (emerald-teal)
          tealHover: "#115E59",
          blue: "#2563EB",      // secondary accent (royal blue)
          blueHover: "#1D4ED8",
          cyan: "#06B6D4",      // supporting accent (subtle cyan)
          emerald: "#10B981",
          amber: "#D97706",
          rose: "#E11D48",
        },
        border: {
          subtle: "#E5EAF0",
          card: "#E2E8F0",
          glass: "rgba(15, 23, 42, 0.08)",
          tealGlow: "rgba(15, 118, 110, 0.25)",
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 30px 0 rgba(15, 23, 42, 0.06)',
        'glass-hover': '0 14px 40px 0 rgba(15, 23, 42, 0.10)',
        'teal-glow': '0 0 25px -4px rgba(15, 118, 110, 0.25)',
        'blue-glow': '0 0 25px -4px rgba(37, 99, 235, 0.25)',
        'card-soft': '0 4px 20px -2px rgba(15, 23, 42, 0.05)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.22, 1, 0.36, 1)',
      }
    },
  },
  plugins: [],
}
