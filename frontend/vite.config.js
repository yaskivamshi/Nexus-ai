import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  server: {
    // Forces Vite to resolve to localhost directly
    host: 'localhost',
    port: 5173,
    // Explicitly handles the instant-sync WebSocket layer
    hmr: {
      host: 'localhost',
      protocol: 'ws',
      port: 5173,
    },
  },
})