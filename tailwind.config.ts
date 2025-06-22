import type { Config } from "tailwindcss";
export default {
  darkMode: "class",
  content: [
    "./client/index.html",
    "./client/src/**/*.{vue,js,ts}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "var(--primary)",
        secondary: "var(--secondary)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        destructive: "var(--destructive)",
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography")
  ],
} satisfies Config;
