import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

const ROOT = __dirname

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(ROOT, 'src'),
    },
  },
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.ts', 'tests/integration/**/*.test.ts'],
    setupFiles: ['./tests/setup.ts'],
    // One test file at a time, each in its own child process (fresh module
    // registry => fresh in-memory rate-limit buckets, single PrismaClient).
    pool: 'forks',
    fileParallelism: false,
    env: {
      // Must point at the dedicated TEST database — never the dev DB.
      DATABASE_URL: 'file:' + resolve(ROOT, 'db/test.db'),
      NODE_ENV: 'test',
    },
  },
})
