import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  // Use root '/' for Vercel/Netlify/Localhost or relative './' for GitHub Pages compatibility
  const isGithubPages = process.env.GITHUB_ACTIONS || process.env.DEPLOY_TARGET === 'gh-pages';
  return {
    plugins: [react()],
    base: isGithubPages ? '/AIKI/' : './',
  }
})
