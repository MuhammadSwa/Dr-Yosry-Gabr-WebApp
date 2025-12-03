import { For } from "solid-js"
import type { Playlist } from "../../lib/staticData"
import type { PlaylistCategory } from "../../lib/types"

interface CategoryFilterProps {
  categories: string[]
  playlists: Playlist[]
  selectedCategory: PlaylistCategory | "all" | "channel"
  onCategoryClick: (category: PlaylistCategory | "all" | "channel") => void
}

const CATEGORY_ICONS: Record<string, string> = {
  "all": "📚",
  "تصوف": "🕌",
  "فقه": "📖",
  "تفسير": "📜",
  "حديث": "📿",
  "عقيدة": "🌙",
  "سيرة": "⭐",
  "متنوع": "🎯",
  "ردود": "💬",
  "صلوات": "🤲",
  "خطب": "🎤",
}

export default function CategoryFilter(props: CategoryFilterProps) {
  const getCategoryCount = (category: string) => {
    if (category === "all") return props.playlists.reduce((sum, p) => sum + p.videoCount, 0)
    return props.playlists
      .filter(p => p.category === category)
      .reduce((sum, p) => sum + p.videoCount, 0)
  }

  return (
    <div class="flex flex-wrap gap-2">
      <button
        onClick={() => props.onCategoryClick("all")}
        class={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
          props.selectedCategory === "all"
            ? "bg-amber-500 text-emerald-950"
            : "bg-emerald-800/50 text-emerald-200 hover:bg-emerald-700/50"
        }`}
      >
        {CATEGORY_ICONS["all"]} الكل
        <span class="mr-2 text-xs opacity-75">({getCategoryCount("all")})</span>
      </button>
      <For each={props.categories}>
        {(category) => (
          <button
            onClick={() => props.onCategoryClick(category as PlaylistCategory)}
            class={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              props.selectedCategory === category
                ? "bg-amber-500 text-emerald-950"
                : "bg-emerald-800/50 text-emerald-200 hover:bg-emerald-700/50"
            }`}
          >
            {CATEGORY_ICONS[category] || "📁"} {category}
            <span class="mr-2 text-xs opacity-75">({getCategoryCount(category)})</span>
          </button>
        )}
      </For>
    </div>
  )
}
