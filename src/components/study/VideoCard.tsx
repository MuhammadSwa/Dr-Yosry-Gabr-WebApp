import { Show } from "solid-js"
import { Link } from "@tanstack/solid-router"
import type { Video } from "../../lib/staticData"
import VideoProgressBadge from "../lessons/VideoProgressBadge"
import { parseDuration, formatViews, formatDate } from "./utils/formatters"

interface VideoCardProps {
  video: Video
  viewMode: "grid" | "list"
  showProgress?: boolean
}

export default function VideoCard(props: VideoCardProps) {
  if (props.viewMode === "list") {
    return <VideoCardList video={props.video} showProgress={props.showProgress} />
  }
  return <VideoCardGrid video={props.video} showProgress={props.showProgress} />
}

interface VideoCardInnerProps {
  video: Video
  showProgress?: boolean
}

function VideoCardGrid(props: VideoCardInnerProps) {
  const v = () => props.video

  return (
    <Link
      to="/study/$id"
      params={{ id: v().id }}
      class="group bg-emerald-900/50 rounded-xl overflow-hidden border border-emerald-700/50 hover:border-amber-500/50 cursor-pointer transition-all duration-300 hover:transform hover:scale-[1.02] hover:shadow-xl hover:shadow-amber-500/10"
    >
      <div class="relative">
        <img src={v().thumbnail} alt={v().title} class="w-full aspect-video object-cover" />
        <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div class="bg-amber-500 rounded-full p-4">
            <svg class="w-8 h-8 text-emerald-950" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
        <Show when={v().duration}>
          <span class="absolute bottom-2 left-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
            {parseDuration(v().duration)}
          </span>
        </Show>
      </div>
      <div class="p-4">
        <h3 class="font-bold text-emerald-50 line-clamp-2 mb-2 group-hover:text-amber-400 transition-colors">
          {v().title}
        </h3>
        <div class="flex justify-between items-center text-sm text-emerald-400">
          <span>{formatDate(v().publishedAt)}</span>
          <Show when={v().viewCount}>
            <span>{formatViews(v().viewCount)} مشاهدة</span>
          </Show>
        </div>
        <Show when={props.showProgress}>
          <VideoProgressBadge videoId={v().id} showProgress={true} showFavorite={true} showWatchLater={true} />
        </Show>
      </div>
    </Link>
  )
}

function VideoCardList(props: VideoCardInnerProps) {
  const v = () => props.video

  return (
    <Link
      to="/study/$id"
      params={{ id: v().id }}
      class="flex gap-4 bg-emerald-900/50 rounded-xl p-4 border border-emerald-700/50 hover:border-amber-500/50 cursor-pointer transition-all duration-300 hover:bg-emerald-900/70"
    >
      <div class="relative shrink-0">
        <img src={v().thumbnail} alt={v().title} class="w-48 h-28 object-cover rounded-lg" />
        <Show when={v().duration}>
          <span class="absolute bottom-2 left-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
            {parseDuration(v().duration)}
          </span>
        </Show>
      </div>
      <div class="flex-1 min-w-0">
        <h3 class="font-bold text-emerald-50 line-clamp-2 mb-2 hover:text-amber-400 transition-colors">
          {v().title}
        </h3>
        <Show when={v().playlistName}>
          <p class="text-emerald-400 text-sm mb-2">{v().playlistName}</p>
        </Show>
        <div class="flex flex-wrap gap-3 text-sm text-emerald-300">
          <span>📅 {formatDate(v().publishedAt)}</span>
          <Show when={v().viewCount}>
            <span>👁️ {formatViews(v().viewCount)}</span>
          </Show>
        </div>
        <Show when={props.showProgress}>
          <VideoProgressBadge videoId={v().id} showProgress={true} showFavorite={true} showWatchLater={true} />
        </Show>
      </div>
    </Link>
  )
}
