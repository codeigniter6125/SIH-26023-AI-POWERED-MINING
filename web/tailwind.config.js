/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        hivis: "var(--hivis)",
        paper: "var(--paper)",
        ink: "var(--ink)",
        "ink-soft": "var(--ink-soft)",
        flag: "var(--flag)",
        stratum: "var(--stratum)",
      },
      fontFamily: {
        display: ["'Bricolage Grotesque'", "ui-sans-serif", "system-ui", "sans-serif"],
        body: ["'Atkinson Hyperlegible'", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "monospace"],
      },
      boxShadow: {
        sticker: "var(--shadow-offset) var(--shadow-offset) 0 var(--ink)",
        "sticker-sm": "3px 3px 0 var(--ink)",
      },
      borderWidth: { 3: "3px" },
    },
  },
  plugins: [],
};
