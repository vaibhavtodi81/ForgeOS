// Imports tailwindcss from @tailwindcss/vite so this module can reuse that component, helper, or library.
import tailwindcss from '@tailwindcss/vite'
// Imports react from @vitejs/plugin-react so this module can reuse that component, helper, or library.
import react from '@vitejs/plugin-react'
// Imports path from path so this module can reuse that component, helper, or library.
import path from 'path'
// Imports defineConfig from vite so this module can reuse that component, helper, or library.
import { defineConfig } from 'vite'

// https://vite.dev/config/
// Exports defineConfig as this file’s default value so other modules can load the main feature.
export default defineConfig({
  // Sets the plugins field so the surrounding object or component receives this setting.
  plugins: [react(), tailwindcss()],
  // Sets the resolve field so the surrounding object or component receives this setting.
  resolve: {
    // Sets the alias field so the surrounding object or component receives this setting.
    alias: {
      // Continues the configuration expression so its related values and behavior stay grouped together.
      '@': path.resolve(import.meta.dirname, './src'),
    // Closes the current block or object so the grouped statements or settings end here.
    },
  // Closes the current block or object so the grouped statements or settings end here.
  },
// Continues the configuration expression so its related values and behavior stay grouped together.
})
// File purpose: Configures Vite's React integration and frontend development/build behavior.
