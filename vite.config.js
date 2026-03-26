import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Forwards /api/* to the Vercel dev server during local development.
      // Run `npx vercel dev` on port 3000 alongside `npm run dev` to use this.
      // OR: deploy to Vercel and test there — the proxy is only for local dev convenience.
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  }
})
