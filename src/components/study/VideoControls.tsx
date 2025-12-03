import { For, Show } from "solid-js";

export type ViewMode = "grid" | "list";
export type SortOption = "date" | "oldest" | "views";

export const VIDEOS_PER_PAGE_OPTIONS = [12, 24, 48, 96];

interface VideoControlsProps {
  totalVideos: number;
  currentPage: number;
  totalPages: number;
  searchQuery: string;
  videosPerPage: number;
  sortBy: SortOption;
  viewMode: ViewMode;
  onVideosPerPageChange: (value: number) => void;
  onSortChange: (value: SortOption) => void;
  onViewModeChange: (value: ViewMode) => void;
  isSearching?: boolean;
}

export default function VideoControls(props: VideoControlsProps) {
  return (
    <div id="video-grid" class="flex flex-wrap items-center justify-between gap-4 mb-6 scroll-mt-24">
      <div class="text-emerald-300 flex items-center gap-2">
        <Show when={props.isSearching}>
          <svg class="w-4 h-4 animate-spin text-amber-400" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span class="text-amber-400">جاري البحث...</span>
        </Show>
        <Show when={!props.isSearching}>
          <span class="font-bold text-amber-400">{props.totalVideos}</span> نتيجة
          {props.searchQuery && (
            <span class="mr-2">للبحث عن "{props.searchQuery}"</span>
          )}
          {props.totalPages > 1 && (
            <span class="mr-2 text-emerald-400">
              (صفحة {props.currentPage} من {props.totalPages})
            </span>
          )}
        </Show>
      </div>

      <div class="flex flex-wrap items-center gap-4">
        {/* Videos Per Page */}
        <div class="flex items-center gap-2">
          <span class="text-emerald-400 text-sm">عرض:</span>
          <select
            value={props.videosPerPage}
            onChange={(e) => props.onVideosPerPageChange(parseInt(e.currentTarget.value))}
            class="bg-emerald-800 border border-emerald-600 rounded-lg px-3 py-2 text-emerald-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
          >
            <For each={VIDEOS_PER_PAGE_OPTIONS}>
              {(option) => (
                <option value={option}>{option}</option>
              )}
            </For>
          </select>
        </div>

        {/* Sort Dropdown */}
        <select
          value={props.sortBy}
          onChange={(e) => props.onSortChange(e.currentTarget.value as SortOption)}
          class="bg-emerald-800 border border-emerald-600 rounded-lg px-4 py-2 text-emerald-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="date">الأحدث</option>
          <option value="oldest">الأقدم</option>
          <option value="views">الأكثر مشاهدة</option>
        </select>

        {/* View Mode Toggle */}
        <div class="flex bg-emerald-800 rounded-lg p-1">
          <button
            onClick={() => props.onViewModeChange("grid")}
            class={`p-2 rounded ${props.viewMode === "grid" ? "bg-amber-500 text-emerald-950" : "text-emerald-300 hover:text-white"}`}
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button
            onClick={() => props.onViewModeChange("list")}
            class={`p-2 rounded ${props.viewMode === "list" ? "bg-amber-500 text-emerald-950" : "text-emerald-300 hover:text-white"}`}
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
