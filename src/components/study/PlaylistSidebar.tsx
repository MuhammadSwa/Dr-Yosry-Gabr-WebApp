import { For, Show } from "solid-js"
import type { Playlist } from "../../lib/staticData"
import type { PlaylistCategory } from "../../lib/types"

interface PlaylistSidebarProps {
  playlists: Playlist[]
  selectedPlaylist: string | null
  selectedCategory: PlaylistCategory | "all" | "channel"
  onPlaylistClick: (playlistId: string) => void
  onClearSelection: () => void
}

export default function PlaylistSidebar(props: PlaylistSidebarProps) {
  const filteredPlaylists = () => {
    if (props.selectedCategory === "all" || props.selectedCategory === "channel") {
      return props.playlists
    }
    return props.playlists.filter(p => p.category === props.selectedCategory)
  }

  return (
    <div class="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
      <Show when={props.selectedPlaylist}>
        <button
          onClick={props.onClearSelection}
          class="w-full text-right px-3 py-2 text-sm text-amber-400 hover:text-amber-300 transition-colors"
        >
          ✕ إلغاء تحديد القائمة
        </button>
      </Show>
      <For each={filteredPlaylists()}>
        {(playlist) => (
          <button
            onClick={() => props.onPlaylistClick(playlist.id)}
            class={`w-full text-right px-3 py-2 rounded-lg transition-all text-sm ${
              props.selectedPlaylist === playlist.id
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/50"
                : "hover:bg-emerald-800/50 text-emerald-200"
            }`}
          >
            <div class="font-medium line-clamp-1">{playlist.name}</div>
            <div class="text-xs text-emerald-400 mt-1">
              {playlist.videoCount} درس
            </div>
          </button>
        )}
      </For>
    </div>
  )
}
