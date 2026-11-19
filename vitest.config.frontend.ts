import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// Front-end test config — jsdom + Testing Library, runs against mocked fetch.
// Kept separate from the backend config (vitest.config.ts) so the two suites
// can run in isolation and in parallel CI jobs.
const ROOT = __dirname

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(ROOT, 'src'),
    },
  },
  test: {
    environment: 'jsdom',
    include: ['tests/frontend/**/*.test.{ts,tsx}'],
    setupFiles: ['./tests/frontend-setup.ts'],
    // One test file per child process — full component trees can be heavy,
    // and this keeps module state (providers, stores) isolated per file.
    pool: 'forks',
    env: {
      NODE_ENV: 'test',
      // Front-end tests never touch a database — API access is always mocked.
    },
  },
})
