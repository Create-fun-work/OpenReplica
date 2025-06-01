/** @type {import('tailwindcss').Config} */
import { heroui } from "@heroui/react";
import typography from "@tailwindcss/typography";
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#8B5CF6", // vibrant purple
        secondary: "#A855F7", // lighter purple
        logo: "#8B5CF6", // purple for logos and icons
        accent: "#C084FC", // light purple accent
        base: "#000000", // pure black background
        "base-secondary": "#1A1A1A", // dark gray background
        "base-tertiary": "#2D2D2D", // lighter dark background
        danger: "#EF4444", // red
        success: "#10B981", // green
        warning: "#F59E0B", // amber
        basic: "#6B7280", // gray
        tertiary: "#374151", // dark gray, used for inputs
        "tertiary-light": "#9CA3AF", // lighter gray, used for borders and placeholder text
        content: "#F3F4F6", // light gray, used mostly for text
        "content-2": "#FFFFFF", // white
        "purple-glow": "#8B5CF650", // purple with transparency for glows
      },
    },
  },
  darkMode: "class",
  plugins: [
    heroui({
      defaultTheme: "dark",
      layout: {
        radius: {
          small: "5px",
          large: "20px",
        },
      },
      themes: {
        dark: {
          colors: {
            primary: "#8B5CF6",
            secondary: "#A855F7",
            logo: "#8B5CF6",
            accent: "#C084FC",
            background: "#000000",
            foreground: "#FFFFFF",
          },
        },
      },
    }),
    typography,
  ],
};
