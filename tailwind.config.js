/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1e3a5f', // Azul escuro/navy do logo
          dark: '#0f1f35',
          light: '#2d4a6f',
        },
        accent: {
          DEFAULT: '#d4af37', // Dourado do logo
          dark: '#b8941f',
          light: '#f5d76e',
        },
      },
    },
  },
  plugins: [],
}
