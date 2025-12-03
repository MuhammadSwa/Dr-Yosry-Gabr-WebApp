import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'

import { tanstackStart } from '@tanstack/solid-start/plugin/vite'
import solidPlugin from 'vite-plugin-solid'

export default defineConfig({
  // Set base path for GitHub Pages (repo name)
  // base: process.env.GITHUB_ACTIONS ? '/Dr-Yosry-Gabr-WebApp/' : '/',
  base: '/Dr-Yosry-Gabr-WebApp/',
  plugins: [
    devtools(),
    // this is the plugin that enables path aliases
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tailwindcss(),
    tanstackStart({
      prerender: {
        // Enable prerendering for static export
        enabled: true,
        // Create /page/index.html for cleaner URLs
        autoSubfolderIndex: true,
        // Auto-discover all static routes
        autoStaticPathsDiscovery: true,
        // Don't crawl links - only prerender main pages (partial prerender)
        crawlLinks: false,
        // How many concurrent prerender jobs
        concurrency: 10,
        // Retry failed prerenders
        retryCount: 2,
        retryDelay: 1000,
        // Don't fail the entire build on a single error
        failOnError: false,
        // Filter out anchor-only links and dashboard
        filter: ({ path }) => {
          // Skip anchor-only URLs
          if (path.includes('#')) return false
          // Skip dashboard (requires client-side IndexedDB)
          if (path.startsWith('/dashboard')) return false
          // Skip individual video pages - they load on-demand
          if (path.match(/^\/study\/[^/]+$/)) return false
          return true
        },
        // Log progress
        onSuccess: ({ page }) => {
          console.log(`✓ Prerendered: ${page.path}`)
        },
      },
    }),
    solidPlugin({ ssr: true }),
  ],
})
