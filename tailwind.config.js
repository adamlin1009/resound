import { withUt } from "uploadthing/tw";

/** @type {import('tailwindcss').Config} */
export default withUt({
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        editorial: ["var(--font-instrument-serif)", "Georgia", "serif"],
        sans: [
          "var(--font-inter)",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        mono: [
          "var(--font-jetbrains-mono)",
          "ui-monospace",
          "SFMono-Regular",
          "monospace",
        ],
      },
      colors: {
        ink: {
          DEFAULT: "#1A1813",
          soft: "#2B2823",
          muted: "#6B6258",
          faint: "#9A9286",
        },
        paper: {
          DEFAULT: "#F4EFE6",
          ivory: "#FBF7F0",
          warm: "#EDE5D3",
          deep: "#E5DDC8",
        },
        rule: "#D9CFB8",
        lacquer: {
          DEFAULT: "#8B1F2A",
          deep: "#6E1820",
          soft: "#B25361",
        },
        brass: {
          DEFAULT: "#A68A4F",
          deep: "#7E6633",
          soft: "#C9B280",
        },
        moss: {
          DEFAULT: "#3D4A2A",
          soft: "#6B7A4D",
        },
      },
      letterSpacing: {
        archive: "0.22em",
        wider: "0.08em",
      },
      animation: {
        shimmer: "shimmer 1.5s ease-in-out infinite",
        "rise-in": "rise-in 0.9s cubic-bezier(0.16, 1, 0.3, 1) both",
        "fade-in": "fade-in 0.7s ease-out both",
        "slow-pan": "slow-pan 18s ease-in-out infinite alternate",
        marquee: "marquee 42s linear infinite",
      },
      keyframes: {
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "rise-in": {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slow-pan": {
          "0%": { transform: "scale(1.02) translate3d(0,0,0)" },
          "100%": { transform: "scale(1.06) translate3d(-2%,-1%,0)" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      boxShadow: {
        archive:
          "0 1px 0 0 rgba(26, 24, 19, 0.04), 0 12px 30px -18px rgba(26, 24, 19, 0.18)",
        lift: "0 24px 60px -28px rgba(26, 24, 19, 0.28)",
      },
      backgroundImage: {
        "paper-grain":
          "radial-gradient(circle at 20% 20%, rgba(166, 138, 79, 0.06) 0, transparent 45%), radial-gradient(circle at 80% 60%, rgba(139, 31, 42, 0.05) 0, transparent 50%)",
      },
    },
  },
  plugins: [require("tailwind-scrollbar")],
});
