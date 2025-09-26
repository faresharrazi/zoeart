import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["DM Serif Display", "serif"], // Make DM Serif Display the default
        serif: ["DM Serif Display", "serif"],
        display: ["DM Serif Display", "serif"], // Add display variant
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        /* Aether Art Space Theme System - Automatic Color Application */
        theme: {
          primary: "hsl(var(--theme-primary))",
          "primary-text": "hsl(var(--theme-primary-text))",
          "primary-hover": "hsl(var(--theme-primary-hover))",
          background: "hsl(var(--theme-background))",
          surface: "hsl(var(--theme-surface))",
          overlay: "hsl(var(--theme-overlay))",
          "text-primary": "hsl(var(--theme-text-primary))",
          "text-secondary": "hsl(var(--theme-text-secondary))",
          "text-on-dark": "hsl(var(--theme-text-on-dark))",
          "text-muted": "hsl(var(--theme-text-muted))",
          border: "hsl(var(--theme-border))",
          "border-hover": "hsl(var(--theme-border-hover))",
          focus: "hsl(var(--theme-focus))",
          success: "hsl(var(--theme-success))",
          warning: "hsl(var(--theme-warning))",
          error: "hsl(var(--theme-error))",
        },
        /* Aether Art Space Palette - Admin Configurable */
        palette: {
          white: "hsl(var(--palette-white))",
          "light-blue": "hsl(var(--palette-light-blue))",
          "medium-blue": "hsl(var(--palette-medium-blue))",
          "dark-navy": "hsl(var(--palette-dark-navy))",
        },
        /* Legacy gallery colors (for backward compatibility) */
        gallery: {
          gold: "hsl(var(--gallery-gold))",
          charcoal: "hsl(var(--gallery-charcoal))",
          "light-grey": "hsl(var(--gallery-light-grey))",
          "medium-grey": "hsl(var(--gallery-medium-grey))",
        },
      },
      backgroundImage: {
        "gradient-hero": "var(--gradient-hero)",
        "gradient-card": "var(--gradient-card)",
      },
      boxShadow: {
        elegant: "var(--shadow-elegant)",
        artwork: "var(--shadow-artwork)",
      },
      transitionTimingFunction: {
        smooth: "var(--transition-smooth)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
