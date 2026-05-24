import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "#08090a", // Negro ultra profundo estilo Linear
          subtle: "#0e1012",     // Fondo secundario oscuro
          card: "#121518",       // Fondo de tarjetas
        },
        border: {
          DEFAULT: "rgba(255, 255, 255, 0.06)", // Bordes sutiles para glassmorphism
          active: "rgba(255, 255, 255, 0.15)",
        },
        text: {
          primary: "#f3f4f6",    // Gris claro brillante
          secondary: "#9ca3af",  // Gris medio/muted
          dim: "#6b7280",        // Gris oscuro para deshabilitados o pistas secundarias
        },
        brand: {
          // Verde euskera moderno/premium combinado con esmeralda vibrante
          DEFAULT: "#00e575",
          hover: "#00cc66",
          dark: "#006633",
          glow: "rgba(0, 229, 117, 0.15)",
        },
        accent: {
          // Violeta eléctrico para contrastes modernos
          purple: "#7c3aed",
          blue: "#3b82f6",
          orange: "#f97316",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        glow: "0 0 20px 0 rgba(0, 229, 117, 0.15)",
        "glow-purple": "0 0 20px 0 rgba(124, 58, 237, 0.15)",
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
      },
      borderRadius: {
        xl: "12px",
        "2xl": "16px",
        "3xl": "24px",
      },
      spacing: {
        18: "4.5rem",
        22: "5.5rem",
      },
      letterSpacing: {
        tightest: "-.03em",
      },
    },
  },
  plugins: [],
};

export default config;
