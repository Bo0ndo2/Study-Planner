import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/context/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--background) / <alpha-value>)",
        foreground: "rgb(var(--foreground) / <alpha-value>)",
        panel: "rgb(var(--panel) / <alpha-value>)",
        panelAlt: "rgb(var(--panel-alt) / <alpha-value>)",
        border: "rgb(var(--border) / <alpha-value>)",
        accent: "rgb(var(--accent) / <alpha-value>)",
        accentSoft: "rgb(var(--accent-soft) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        danger: "rgb(var(--danger) / <alpha-value>)",
        success: "rgb(var(--success) / <alpha-value>)",
      },
      boxShadow: {
        glow: "0 18px 50px rgba(15, 23, 42, 0.12)",
      },
      backgroundImage: {
        "hero-grid":
          "linear-gradient(135deg, rgba(78, 101, 241, 0.10), rgba(26, 148, 95, 0.08)), linear-gradient(180deg, rgba(255,255,255,0.65), rgba(255,255,255,0.25))",
      },
    },
  },
  plugins: [],
};

export default config;
