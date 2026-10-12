/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* Adaptive surface & background palette */
        "surface-container-lowest": "rgb(var(--surface-container-lowest) / <alpha-value>)",
        "surface-container-low":    "rgb(var(--surface-container-low) / <alpha-value>)",
        "surface-container":        "rgb(var(--surface-container) / <alpha-value>)",
        "surface-container-high":   "rgb(var(--surface-container-high) / <alpha-value>)",
        "surface-container-highest":"rgb(var(--surface-container-highest) / <alpha-value>)",
        "surface-dim":              "rgb(var(--surface-dim) / <alpha-value>)",
        "surface":                  "rgb(var(--surface) / <alpha-value>)",
        "surface-bright":           "rgb(var(--surface-bright) / <alpha-value>)",
        "surface-variant":          "rgb(var(--surface-variant) / <alpha-value>)",
        "surface-tint":             "#2563eb",
        "background":               "rgb(var(--background) / <alpha-value>)",
        "on-background":            "rgb(var(--on-background) / <alpha-value>)",
        "on-surface":               "rgb(var(--on-surface) / <alpha-value>)",
        "on-surface-variant":       "rgb(var(--on-surface-variant) / <alpha-value>)",
        "inverse-surface":          "rgb(var(--inverse-surface) / <alpha-value>)",
        "inverse-on-surface":       "rgb(var(--inverse-on-surface) / <alpha-value>)",

        /* Primary: Royal Tech Blue */
        "primary":                  "rgb(var(--user-primary, 37 99 235) / <alpha-value>)",
        "primary-container":        "rgb(var(--user-primary-container, 29 78 216) / <alpha-value>)",
        "primary-fixed":            "rgb(var(--user-primary-fixed, 147 197 253) / <alpha-value>)",
        "primary-fixed-dim":        "rgb(var(--user-primary-fixed-dim, 59 130 246) / <alpha-value>)",
        "on-primary":               "#ffffff",
        "on-primary-container":     "#eff6ff",
        "on-primary-fixed":         "rgb(var(--user-on-primary-fixed, 30 58 138) / <alpha-value>)",
        "on-primary-fixed-variant": "#1d4ed8",
        "inverse-primary":          "#1d4ed8",

        /* Secondary: Refined Sky / Tech Cyan */
        "secondary":                "rgb(var(--user-secondary, 14 165 233) / <alpha-value>)",
        "secondary-container":      "rgb(var(--user-secondary-container, 2 132 199) / <alpha-value>)",
        "secondary-fixed":          "#bae6fd",
        "secondary-fixed-dim":      "#38bdf8",
        "on-secondary":             "rgb(var(--user-on-secondary, 255 255 255) / <alpha-value>)",
        "on-secondary-container":   "rgb(var(--user-on-secondary-container, 240 249 255) / <alpha-value>)",
        "on-secondary-fixed":       "#0c4a6e",
        "on-secondary-fixed-variant":"#0369a1",

        /* Tertiary: Emerald Green for speed & success */
        "tertiary":                 "#10b981",
        "tertiary-container":       "#059669",
        "tertiary-fixed":           "#a7f3d0",
        "tertiary-fixed-dim":       "#34d399",
        "on-tertiary":              "#ffffff",
        "on-tertiary-container":    "#ecfdf5",
        "on-tertiary-fixed":        "#064e3b",
        "on-tertiary-fixed-variant":"#047857",

        /* Outlines */
        "outline":                  "rgb(var(--outline) / <alpha-value>)",
        "outline-variant":          "rgb(var(--outline-variant) / <alpha-value>)",

        /* Error */
        "error":                    "#ef4444",
        "error-container":          "#991b1b",
        "on-error":                 "#ffffff",
        "on-error-container":       "#fee2e2",
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg":      "0.5rem",
        "xl":      "0.75rem",
        "2xl":     "1rem",
        "3xl":     "1.5rem",
        "full":    "9999px"
      },
      spacing: {
        "base":              "8px",
        "section-gap":       "64px",
        "container-padding": "24px",
        "card-padding":      "20px",
        "gutter":            "16px"
      },
      fontFamily: {
        "sans":               ["var(--font-cairo)", "Cairo", "sans-serif"],
        "price-display":      ["JetBrains Mono", "monospace"],
        "display-lg":         ["var(--font-cairo)", "Cairo", "Plus Jakarta Sans", "sans-serif"],
        "headline-md":        ["var(--font-cairo)", "Cairo", "Plus Jakarta Sans", "sans-serif"],
        "body-lg":            ["var(--font-cairo)", "Cairo", "Inter", "sans-serif"],
        "body-md":            ["var(--font-cairo)", "Cairo", "Inter", "sans-serif"],
        "label-sm":           ["JetBrains Mono", "monospace"],
        "display-lg-mobile":  ["var(--font-cairo)", "Cairo", "Plus Jakarta Sans", "sans-serif"]
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
