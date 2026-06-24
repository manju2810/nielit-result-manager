/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          900: "#0F2A43", // primary navy — headers, primary actions
          700: "#1C3F5E",
          500: "#2D5578",
        },
        gold: {
          DEFAULT: "#C9A227", // accent — used sparingly (signature element)
          50: "#FBF6E5",
        },
        paper: "#F6F7F9", // page background
        slate: {
          850: "#1F2937",
        },
      },
      fontFamily: {
        display: ["Sora", "ui-sans-serif", "system-ui"],
        body: ["Inter", "ui-sans-serif", "system-ui"],
        mono: ["IBM Plex Mono", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
}