import { createFileRoute, Link } from '@tanstack/solid-router'
import { Show } from 'solid-js'
import VideoPage from '../../components/lessons/VideoPage'
import { loadVideoPage, type VideoPageData } from '../../lib/staticData'

export const Route = createFileRoute('/study/$id')({
  loader: ({ params }) => loadVideoPage(params.id),
  component: StudyVideoPage,
})

function StudyVideoPage() {
  const data = Route.useLoaderData()

  return (
    <Show
      when={data()}
      fallback={
        <div class="min-h-screen bg-emerald-950 flex items-center justify-center">
          <div class="text-center">
            <h1 class="text-2xl text-amber-400 mb-4">الفيديو غير موجود</h1>
            <Link to="/study" class="text-emerald-300 hover:text-amber-400 transition-colors">
              العودة للدروس
            </Link>
          </div>
        </div>
      }
    >
      {(pageData) => (
        <VideoPage
          video={pageData().video}
          prevVideo={pageData().prevVideo}
          nextVideo={pageData().nextVideo}
          playlistName={pageData().playlistName}
          playlistVideoCount={pageData().playlistVideoCount}
          currentIndex={pageData().currentIndex}
        />
      )}
    </Show>
  )
}
