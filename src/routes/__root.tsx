import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/solid-router'
import { TanStackRouterDevtools } from '@tanstack/solid-router-devtools'

import { HydrationScript } from 'solid-js/web'
import { Suspense } from 'solid-js'


import styleCss from '../styles.css?url'
import Navbar from '../components/layout/NavBar'
import Footer from '../components/layout/Footer'

export const Route = createRootRouteWithContext()({
  head: () => ({
    links: [
      { rel: 'stylesheet', href: styleCss },
    ],
  }),
  shellComponent: RootComponent,
})

function RootComponent() {
  return (
    <html lang="ar" dir="rtl" class="scroll-smooth">
      <head>
        <HydrationScript />
      </head>
      <body>
        <HeadContent />
        <Suspense>
          <Navbar />

          <Outlet />
          <Footer />
          <TanStackRouterDevtools />
        </Suspense>
        <Scripts />
      </body>
    </html>
  )
}
