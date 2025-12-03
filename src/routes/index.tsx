import { createFileRoute } from "@tanstack/solid-router"
import HeroSection from "../components/home/Hero"

export const Route = createFileRoute('/')({ component: App })

function App() {

  return (
    <HeroSection />
  )
}
