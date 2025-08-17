import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    open: false, // This stops it from auto-opening in the browser
    port: 4000,  // Optional: set to your preferred port
  }
})
