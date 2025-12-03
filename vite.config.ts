import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'

import { tanstackStart } from '@tanstack/solid-start/plugin/vite'
import solidPlugin from 'vite-plugin-solid'

const basePath = '/Dr-Yosry-Gabr-WebApp/'

export default defineConfig({
  base: basePath,
  plugins: [
    devtools(),
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tailwindcss(),
    tanstackStart({
      prerender: {
        enabled: true,
        autoSubfolderIndex: true,
        crawlLinks: false,
        failOnError: false,
        // Only prerender pages that aren't /study or /dashboard
        filter: ({ path }) => {
          if (path.includes('#')) return false
          const cleanPath = path.startsWith(basePath) 
            ? '/' + path.slice(basePath.length) 
            : path
          if (cleanPath.startsWith('/study')) return false
          if (cleanPath.startsWith('/dashboard')) return false
          return true
        },
      },
      // Explicitly define root page with base path
      pages: [
        { path: basePath, prerender: { enabled: true, outputPath: '/index.html' } },
      ],
    }),
    solidPlugin({ ssr: true }),
  ],
})
