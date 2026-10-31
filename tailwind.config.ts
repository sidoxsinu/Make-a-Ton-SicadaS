import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    borderRadius: {
      none: "0",
      DEFAULT: "2px",
      sm: "2px",
      md: "2px",
      lg: "2px",
      xl: "2px",
      "2xl": "2px",
      "3xl": "2px",
      full: "2px",
    },
    boxShadow: {
      none: "none",
    },
    dropShadow: {},
    colors: {
      transparent: "transparent",
      current: "currentColor",
      paper: "var(--paper)",
      sheet: "var(--sheet)",
      hover: "var(--hover)",
      selected: "var(--selected)",
      ink: "var(--ink)",
      "ink-2": "var(--ink-2)",
      rule: "var(--rule)",
      "rule-strong": "var(--rule-strong)",
      accent: "var(--accent)",
      "accent-ink": "var(--accent-ink)",
      ok: "var(--ok)",
      warn: "var(--warn)",
      bad: "var(--bad)",
    },
    fontFamily: {
      sans: ['"IBM Plex Sans"', "sans-serif"],
      mono: ['"IBM Plex Mono"', "monospace"],
    },
    extend: {},
  },
  plugins: [],
};

export default config;

