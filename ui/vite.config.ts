import { defineConfig } from 'vite'

// Minimal config without @vitejs/plugin-react to avoid ESM require issues in some environments.
export default defineConfig({
  server: { port: 5173 }
})
