import { createFileRoute, Link } from '@tanstack/solid-router'
import { For } from 'solid-js'
import { demoVideos } from '../../lib/demoData'

export const Route = createFileRoute('/study/old')({
  component: StudyIndexPage,
})

function StudyIndexPage() {
  return (
    <div class="min-h-screen bg-emerald-950 pt-20 p-8">
      <div class="container mx-auto">
        <h1 class="text-3xl font-bold text-amber-400 mb-8">مركز الدراسة</h1>
        
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <For each={demoVideos}>
            {(video) => (
              <Link
                to="/study/$id"
                params={{ id: video.id }}
                class="group block bg-emerald-900/50 rounded-xl overflow-hidden border border-emerald-700/50 hover:border-amber-500/50 transition-all"
              >
                <div class="aspect-video bg-emerald-800 overflow-hidden">
                  <img
                    src={video.thumbnails.medium?.url || video.thumbnails.default?.url}
                    alt={video.title}
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div class="p-4">
                  <h2 class="text-lg font-bold text-emerald-100 group-hover:text-amber-400 transition-colors line-clamp-2">
                    {video.title}
                  </h2>
                  <p class="text-sm text-emerald-400 mt-2">
                    {video.playlistName}
                  </p>
                </div>
              </Link>
            )}
          </For>
        </div>
      </div>
    </div>
  )
}
