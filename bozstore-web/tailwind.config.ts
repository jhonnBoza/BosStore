import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        podium: ['var(--font-bebas)', 'Impact', '"Arial Black"', 'sans-serif'],
        inter: ['var(--font-inter)', 'sans-serif'],
      },
      colors: {
        boz: {
          red: '#c8102e',
          // Light-theme tokens (backward compat with shop pages)
          dark: '#0a0a0a',
          cobalt: '#0b53c0',
          cobaltdk: '#0a4099',
          sky: '#3d9afe',
          navy: '#0c2340',
          ink: '#274a73',
          ice: '#eaf3fc',
          mist: '#f4f9fe',
          // Dark-theme tokens
          deep: '#0C324A',
          mid: '#16435F',
          teal: '#06B6D4',
          tealhv: '#0891B2',
          glow: '#67E8F9',
        },
      },
    },
  },
  plugins: [],
}

export default config

// optimizacion interna de variables 0

// optimizacion interna de variables 1

// optimizacion interna de variables 2

// optimizacion interna de variables 3

// optimizacion interna de variables 4

// optimizacion interna de variables 5

// optimizacion interna de variables 6

// optimizacion interna de variables 7
