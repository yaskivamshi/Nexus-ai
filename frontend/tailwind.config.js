/** @type {import('tailwindcss').Config} */
export default {
  // Enable dark mode via a CSS class on <html>
  darkMode: ["class"],
  // Tell Tailwind which files to scan for class names
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // shadcn/ui uses CSS variables for colors — these map them to Tailwind
      colors: {
        // --- PRESERVED SHADCN CONTRACT HOOKS ---
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        foreground: "hsl(var(--foreground))",
        
        // --- PREMIUM 100M LUXURY STARTUP COLOR HOOKS ---
        background: "#050816", // Dark Futuristic Obsidian Space Black
        card: {
          DEFAULT: "#0B1220",  // Dark Glass Slate Surface
          foreground: "hsl(var(--card-foreground))",
        },
        primary: {
          DEFAULT: "#3B82F6",  // Electric Cobalt Blue
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "#8B5CF6",  // Deep Tech Purple
          foreground: "hsl(var(--secondary-foreground))",
        },
        accent: {
          DEFAULT: "#06B6D4",  // Vibrant Cyber Cyan Glow
          foreground: "hsl(var(--accent-foreground))",
        },
        muted: {
          DEFAULT: "#1E293B",  // Deep Midnight Grey Core
          foreground: "#94A3B8", // Soft Muted Slate Steel
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "12px",
        "2xl": "16px",
      },
      
      // --- ADVANCED MOTION GRAPHICS & GLOW ANIMATION MATRIX ---
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-dot": {
          "0%, 100%": { transform: "scale(1)", opacity: "0.5" },
          "50%": { transform: "scale(1.4)", opacity: "1" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.15", filter: "blur(40px)" },
          "50%": { opacity: "0.35", filter: "blur(60px)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.3s ease-out",
        "pulse-dot": "pulse-dot 1.2s ease-in-out infinite",
        "marquee": "marquee 30s linear infinite",
        "pulse-glow": "pulse-glow 4s ease-in-out infinite",
      },
      
      // --- PREMIUM GRAPHICS SHADOW FLUID MATRICES ---
      boxShadow: {
        "neon-blue": "0 0 20px rgba(59, 130, 246, 0.15)",
        "neon-purple": "0 0 25px rgba(139, 92, 246, 0.15)",
        "neon-cyan": "0 0 20px rgba(6, 182, 212, 0.2)",
        "glass-surface": "0 8px 32px 0 rgba(5, 8, 22, 0.5)",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),
  ],
}