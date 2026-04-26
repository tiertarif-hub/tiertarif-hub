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
  // KYRA: Safelist sorgt dafür, dass dynamische Klassen aus der DB nicht gelöscht werden
  safelist: [
    // Bestehende Orange-Klassen
    'bg-slate-900', 'text-[#FF8400]', 'border-[#FF8400]', 'bg-[#FF8400]', 
    'hover:bg-[#FF8400]/90', 'text-orange-50', 'bg-orange-50', 'border-orange-100',
    
    // NEU: Rank-Scout Content-Hub Standard-Klassen (Sicherstellung für Supabase)
    'bg-slate-50', 'bg-slate-100',
    'text-slate-500', 'text-slate-600', 'text-slate-700', 'text-slate-800', 'text-slate-950',
    'bg-blue-50', 'bg-blue-100', 'bg-blue-600', 'bg-blue-700', 'bg-blue-900',
    'text-blue-100', 'text-blue-200', 'text-blue-600', 'text-blue-800', 'text-blue-900',
    'border-blue-100', 'border-blue-200', 'border-blue-500', 'border-blue-800',
    
    // NEU: Unsere exakten Brand-Klassen
    'text-rsblue', 'bg-rsblue', 'border-rsblue', 'text-[#003366]', 'bg-[#003366]',

    // NEU: Responsive Table Wrapper aus sanitizeHtml.ts (runtime-injiziert)
    'overflow-x-auto', 'my-6', 'rounded-2xl', 'border', 'border-slate-200', 'bg-white', 'shadow-sm'
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
      fontFamily: {
        display: ['Outfit', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // NEU: Das offizielle Rank-Scout Blau
        rsblue: {
          DEFAULT: '#003366',
          light: '#e6f0fa', // Ein perfekt passendes, sehr helles Blau für Hintergründe
        },
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
        // Theme-specific colors
        dating: {
          DEFAULT: "hsl(var(--dating))",
          foreground: "hsl(var(--dating-foreground))",
        },
        casino: {
          DEFAULT: "hsl(var(--casino))",
          foreground: "hsl(var(--casino-foreground))",
        },
        adult: {
          DEFAULT: "hsl(var(--adult))",
          foreground: "hsl(var(--adult-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out forwards",
        "slide-up": "slide-up 0.6s ease-out forwards",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
  ],
} satisfies Config;