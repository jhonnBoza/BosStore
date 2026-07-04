import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Solo los tests fuente — nunca los .js compilados en dist/
    include: ['src/**/*.test.ts'],
  },
})
