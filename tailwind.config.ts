import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Couleurs du drapeau du Niger — identité visuelle NaYa
        "naya-orange": {
          DEFAULT: "#E05206",
          light: "#F8914A",
          dark: "#B03F04",
        },
        "naya-green": {
          DEFAULT: "#0DB02B",
          light: "#4FD168",
          dark: "#097A1F",
        },
        "naya-white": "#FFFFFF",
        "naya-ink": "#1A1A1A",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
