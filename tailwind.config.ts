import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        paper: "#f5f5f7",
        ink: "#1d1d1f",
        muted: "#6e6e73",
        line: "#e5e5ea",
        accent: "#f4b400"
      },
      boxShadow: {
        soft: "0 14px 40px rgba(29, 29, 31, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
