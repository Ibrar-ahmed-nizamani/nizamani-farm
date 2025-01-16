import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontSize: {
        tiny: "0.65rem", // 10.4px
        xs: "0.75rem", // 12px (default)
        sm: "1.1rem", // 14px (default) "0.875rem" (default),
        base: "1.1rem", // 16px (default)
        lg: "1.125rem", // 18px (default)
        xl: "1.25rem", // 20px (default)
        "2xl": "1.5rem", // 24px (default)
        "3xl": "1.875rem", // 30px (default)
        "4xl": "2.25rem", // 36px (default)
        "5xl": "3rem", // 48px (default)
        "6xl": "3.75rem", // 60px (default)
        "7xl": "4.5rem", // 72px (default)
        "8xl": "6rem", // 96px (default)
        "9xl": "8rem", // 128px (default)
        // Add your custom sizes
        massive: "10rem", // 160px
        huge: "12rem", // 192px
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
