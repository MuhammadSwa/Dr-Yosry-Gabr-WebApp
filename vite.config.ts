import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'

import { tanstackStart } from '@tanstack/solid-start/plugin/vite'
import solidPlugin from 'vite-plugin-solid'

const basePath = '/Dr-Yosry-Gabr-WebApp/'

export default defineConfig({
  // Set base path for GitHub Pages (repo name)
  base: basePath,
  plugins: [
    devtools(),
    // this is the plugin that enables path aliases
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tailwindcss(),
    tanstackStart({
      // Enable SPA mode for client-side fallback (generates _shell.html)
      spa: {
        enabled: true,
        maskPath: basePath,
      },
      prerender: {
        // Enable prerendering for static export
        enabled: true,
        // Create /page/index.html for cleaner URLs
        autoSubfolderIndex: true,
        // Auto-discover all static routes
        autoStaticPathsDiscovery: true,
        // Don't crawl links - causes duplicate pages with/without base path
        crawlLinks: false,
        // How many concurrent prerender jobs
        concurrency: 10,
        // Retry failed prerenders
        retryCount: 3,
        retryDelay: 1000,
        // Don't fail the entire build on a single error
        failOnError: false,
        // Filter out /study, /dashboard, and anchor links
        filter: ({ path }) => {
          // Skip anchor-only links
          if (path.includes('#')) return false
          // Normalize path - remove base path if present
          let cleanPath = path
          if (path.startsWith(basePath)) {
            cleanPath = '/' + path.slice(basePath.length)
          }
          // Skip /study and /dashboard - they are client-side only
          if (cleanPath.startsWith('/study')) return false
          if (cleanPath.startsWith('/dashboard')) return false
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
