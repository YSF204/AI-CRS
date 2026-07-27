import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, import.meta.dirname, '')

  if (mode === 'production' && !env.VITE_CLERK_PUBLISHABLE_KEY) {
    throw new Error(
      'VITE_CLERK_PUBLISHABLE_KEY is required for production builds.',
    )
  }

  return {
    plugins: [react(), tailwindcss()],
  }
})
