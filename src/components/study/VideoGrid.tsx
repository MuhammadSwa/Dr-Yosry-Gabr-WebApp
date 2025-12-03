import { For, Show } from "solid-js"
import type { Video } from "../../lib/staticData"
import VideoCard from "./VideoCard"
import Pagination from "./Pagination"

interface VideoGridProps {
  videos: Video[]
  viewMode: "grid" | "list"
  totalVideos: number
  currentPage: number
  totalPages: number
  videosPerPage: number
  mounted: boolean
  onPageChange: (page: number) => void
}

export default function VideoGrid(props: VideoGridProps) {
  return (
    <div>
      <Show
        when={props.videos.length > 0}
        fallback={
          <div class="text-center py-12">
            <p class="text-emerald-400 text-lg">لا توجد دروس متاحة</p>
          </div>
        }
      >
        <div
          class={
            props.viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              : "flex flex-col gap-4"
          }
        >
          <For each={props.videos}>
            {(video) => (
              <VideoCard video={video} viewMode={props.viewMode} showProgress={props.mounted} />
            )}
          </For>
        </div>

        <Show when={props.totalPages > 1}>
          <div class="mt-8">
            <Pagination
              currentPage={props.currentPage}
              totalPages={props.totalPages}
              onPageChange={props.onPageChange}
            />
          </div>
        </Show>
      </Show>
    </div>
  )
}
