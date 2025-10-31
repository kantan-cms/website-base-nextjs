import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2D5A3D",
          50: "#E8F5EA",
          100: "#D1EBD5",
          200: "#A3D7AB",
          300: "#75C381",
          400: "#47AF57",
          500: "#2D5A3D",
          600: "#24482F",
          700: "#1B3621",
          800: "#122413",
          900: "#091205",
        },
        secondary: {
          DEFAULT: "#4A7C59",
          50: "#F0F7F2",
          100: "#E1EFE5",
          200: "#C3DFCB",
          300: "#A5CFB1",
          400: "#87BF97",
          500: "#4A7C59",
          600: "#3C6347",
          700: "#2D4A35",
          800: "#1E3123",
          900: "#0F1811",
        },
        neutral: "#6B7280",
        accent: {
          DEFAULT: "#10B981",
          50: "#E6FBF7",
          100: "#CCF7EF",
          200: "#99EFDF",
          300: "#66E7CF",
          400: "#33DFBF",
          500: "#10B981",
          600: "#0D9467",
          700: "#0A6F4D",
          800: "#074A33",
          900: "#032519",
        },
        text: "#1F2937",
        background: "#FFFFFF",
        foreground: "var(--foreground)",
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      typography: {
        DEFAULT: {
          css: {
            color: '#1F2937',
            maxWidth: 'none',
          },
        },
      },
    },
  },
  plugins: [],
};

export default config;