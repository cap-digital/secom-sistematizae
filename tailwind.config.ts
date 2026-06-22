import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "var(--cream)",
        "cream-deep": "var(--cream-deep)",
        paper: "var(--paper)",
        "paper-soft": "var(--paper-soft)",
        ink: "var(--ink)",
        "ink-soft": "var(--ink-soft)",
        line: "var(--line)",
        terracotta: "var(--terracotta)",
        "terracotta-deep": "var(--terracotta-deep)",
        "terracotta-soft": "var(--terracotta-soft)",
        forest: "var(--forest)",
        "forest-mid": "var(--forest-mid)",
        "forest-soft": "var(--forest-soft)",
        ochre: "var(--ochre)",
        "ochre-soft": "var(--ochre-soft)",
        clay: "var(--clay)",
        teal: "var(--teal)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
