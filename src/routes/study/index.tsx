import { createFileRoute, useNavigate } from '@tanstack/solid-router'
import { createSignal, createEffect, onMount, onCleanup } from "solid-js"
import type { PlaylistCategory } from "../../lib/types"
import type { Video, Playlist, VideoPage, StudyHomeData } from "../../lib/staticData"
import { loadStudyHome, search } from "../../lib/staticData"
import * as v from 'valibot'

import {
  StudyHeader,
  StudySidebar,
  VideoGrid,
  VideoControls,
  CustomScrollbarStyles,
  type ViewMode,
  type SortOption,
} from "../../components/study"

const searchSchema = v.object({
  category: v.optional(
    v.pipe(
      v.picklist(['all', 'channel', 'تصوف', 'فقه', 'تفسير', 'حديث', 'عقيدة', 'سيرة', 'متنوع', 'ردود', 'صلوات', 'خطب'] as const),
      v.transform(val => val === 'all' ? undefined : val)
    )
  ),
  playlist: v.optional(v.pipe(v.string(), v.transform(s => s || undefined))),
  view: v.optional(v.picklist(['grid', 'list'] as const)),
  sort: v.optional(v.picklist(['date', 'oldest', 'views'] as const)),
  page: v.optional(
    v.pipe(v.unknown(), v.transform(val => {
      const num = Number(val)
      return isNaN(num) || num < 1 ? undefined : num === 1 ? undefined : num
    }))
  ),
})

export const Route = createFileRoute('/study/')({
  ssr: false, // Client-side only - no prerendering
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({
    page: search.page ?? 1,
    sort: search.sort ?? 'date',
    category: search.category as PlaylistCategory | 'all' | 'channel' | undefined,
    playlistId: search.playlist,
  }),
  loader: ({ deps }) => loadStudyHome(deps),
  component: StudyPage,
})

function StudyPage() {
  const data = Route.useLoaderData()
  const searchParams = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })

  // Search state
  const [query, setQuery] = createSignal('')
  const [searchResults, setSearchResults] = createSignal<VideoPage | null>(null)
  const [isSearching, setIsSearching] = createSignal(false)
  const [searchPage, setSearchPage] = createSignal(1)

  let searchTimeout: ReturnType<typeof setTimeout> | null = null

  const performSearch = async (q: string, page = 1) => {
    if (!q.trim()) {
      setSearchResults(null)
      return
    }
    setIsSearching(true)
    try {
      const results = await search(q, {
        page,
        pageSize: 24,
        category: selectedCategory(),
        playlistId: selectedPlaylist() || undefined,
      })
      setSearchResults(results)
    } finally {
      setIsSearching(false)
    }
  }

  createEffect(() => {
    const q = query()
    if (searchTimeout) clearTimeout(searchTimeout)
    setSearchPage(1)
    if (!q.trim()) {
      setSearchResults(null)
      return
    }
    searchTimeout = setTimeout(() => performSearch(q, 1), 300)
  })

  onCleanup(() => { if (searchTimeout) clearTimeout(searchTimeout) })

  // Navigation helpers
  const selectedCategory = () => searchParams().category ?? 'all'
  const selectedPlaylist = () => searchParams().playlist ?? null
  const viewMode = () => searchParams().view ?? 'grid'
  const sortBy = () => searchParams().sort ?? 'date'
  const currentPage = () => searchParams().page ?? 1

  const setCategory = (cat: string) => navigate({
    search: p => ({ ...p, category: cat === 'all' ? undefined : cat, playlist: undefined, page: undefined }),
    replace: true,
  })

  const setPlaylist = (id: string | null) => navigate({
    search: p => ({ ...p, playlist: id || undefined, page: undefined }),
    replace: true,
  })

  const setView = (v: ViewMode) => navigate({
    search: p => ({ ...p, view: v === 'grid' ? undefined : v }),
    replace: true,
  })

  const setSort = (s: SortOption) => navigate({
    search: p => ({ ...p, sort: s === 'date' ? undefined : s, page: undefined }),
    replace: true,
  })

  const setPage = (n: number) => navigate({
    search: p => ({ ...p, page: n <= 1 ? undefined : n }),
    replace: true,
  })

  // Mounted state for client-only features
  const [mounted, setMounted] = createSignal(false)
  onMount(() => setMounted(true))

  // Derived data
  const { index, videos } = data()
  const isSearchMode = () => query().trim().length > 0

  const displayVideos = () => isSearchMode() && searchResults() ? searchResults()! : videos
  const activePage = () => isSearchMode() ? searchPage() : currentPage()

  const handlePageChange = (p: number) => {
    if (isSearchMode()) {
      setSearchPage(p)
      performSearch(query(), p)
    } else {
      setPage(p)
    }
  }

  return (
    <div class="min-h-screen bg-emerald-950 text-emerald-50">
      <StudyHeader
        title="المكتبة المرئية"
        description="قناة د. يسري جبر على اليوتيوب"
        stats={{
          totalVideos: index.stats.totalVideos,
          totalPlaylists: index.stats.totalPlaylists,
          categoriesCount: index.stats.categoriesCount,
        }}
        searchQuery={query()}
        onSearchChange={setQuery}
      />

      <main class="container mx-auto px-4 py-8">
        <div class="flex flex-col lg:flex-row gap-8">
          <StudySidebar
            categories={index.categories}
            playlists={index.playlists}
            selectedCategory={selectedCategory()}
            selectedPlaylist={selectedPlaylist()}
            onCategoryClick={(cat) => { setCategory(cat); setPlaylist(null) }}
            onPlaylistClick={(id) => setPlaylist(id === selectedPlaylist() ? null : id)}
            onClearPlaylistSelection={() => setPlaylist(null)}
          />

          <div class="flex-1 order-1 lg:order-2">
            <VideoControls
              totalVideos={displayVideos().total}
              currentPage={activePage()}
              totalPages={displayVideos().totalPages}
              searchQuery={query()}
              videosPerPage={24}
              sortBy={sortBy()}
              viewMode={viewMode()}
              onVideosPerPageChange={() => {}}
              onSortChange={setSort}
              onViewModeChange={setView}
              isSearching={isSearching()}
            />

            <VideoGrid
              videos={displayVideos().items}
              viewMode={viewMode()}
              totalVideos={displayVideos().total}
              currentPage={activePage()}
              totalPages={displayVideos().totalPages}
              videosPerPage={24}
              mounted={mounted()}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </main>

      <CustomScrollbarStyles />
    </div>
  )
}

export type { Video as VideoSummary, Playlist as PlaylistSummary }
