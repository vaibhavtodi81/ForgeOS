import { defineConfig } from 'vitest/config' // Imports test-runner helpers for defining and checking this behavior.

export default defineConfig({ // Creates and exports the Vitest settings so the test runner knows how to prepare tests.
  test: { // Sets `test` to the test value.
    setupFiles: ['./tests/setup.ts'], // Runs shared setup before each test file so common mocks and environment settings are ready.
  }, // Closes the current call, object, or collection so the surrounding expression can continue.
}) // Closes the current call, object, or collection so the surrounding expression can continue.
// File purpose: Configures Vitest to run the server's test files and setup code.
