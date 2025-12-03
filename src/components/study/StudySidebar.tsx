import { Show } from "solid-js"
import type { Playlist } from "../../lib/staticData"
import type { PlaylistCategory } from "../../lib/types"
import CategoryFilter from "./CategoryFilter"
import PlaylistSidebar from "./PlaylistSidebar"

interface StudySidebarProps {
  categories: string[]
  playlists: Playlist[]
  selectedCategory: PlaylistCategory | "all" | "channel"
  selectedPlaylist: string | null
  onCategoryClick: (category: PlaylistCategory | "all" | "channel") => void
  onPlaylistClick: (playlistId: string) => void
  onClearPlaylistSelection: () => void
}

export default function StudySidebar(props: StudySidebarProps) {
  return (
    <aside class="lg:w-80 order-2 lg:order-1">
      <div class="bg-emerald-900/30 rounded-xl p-4 border border-emerald-700/30 sticky top-24">
        {/* Categories */}
        <div class="mb-6">
          <h3 class="text-lg font-bold text-amber-400 mb-4">التصنيفات</h3>
          <CategoryFilter
            categories={props.categories}
            playlists={props.playlists}
            selectedCategory={props.selectedCategory}
            onCategoryClick={props.onCategoryClick}
          />
        </div>

        {/* Playlists */}
        <div>
          <h3 class="text-lg font-bold text-amber-400 mb-4">قوائم التشغيل</h3>
          <PlaylistSidebar
            playlists={props.playlists}
            selectedPlaylist={props.selectedPlaylist}
            selectedCategory={props.selectedCategory}
            onPlaylistClick={props.onPlaylistClick}
            onClearSelection={props.onClearPlaylistSelection}
          />
        </div>
      </div>
    </aside>
  )
}
