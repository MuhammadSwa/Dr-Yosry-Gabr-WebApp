/**
 * Static Data API
 * 
 * Fetches pre-generated JSON files from /data/
 * Optimized for minimal network requests.
 */

import type { PlaylistCategory } from "./types"

// =============================================================================
// TYPES
// =============================================================================

export interface Video {
  id: string
  title: string
  publishedAt: string
  duration: string
  thumbnail: string
  viewCount: string
  playlistId?: string
  playlistName?: string
  category?: string
}

export interface VideoDetails extends Video {
  description: string
  likeCount?: string
  commentCount?: string
  tags?: string[]
  nav: {
    prev: string | null
    next: string | null
    index: number
    total: number
  }
}

export interface Playlist {
  id: string
  name: string
  category: string
  videoCount: number
}

export interface SiteIndex {
  stats: {
    totalVideos: number
    totalPlaylists: number
    categoriesCount: number
    lastUpdated: string
  }
  categories: string[]
  playlists: Playlist[]
  pagination: {
    all: number
    byCategory: Record<string, number>
    byPlaylist: Record<string, number>
  }
}

export interface VideoPage {
  items: Video[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// =============================================================================
// FETCH HELPERS
// =============================================================================

// LRU-style cache with size limit to prevent memory bloat on client
const MAX_CACHE_SIZE = 100
const cache = new Map<string, unknown>()

function cacheSet(key: string, value: unknown) {
  // Simple LRU: if cache is full, delete oldest entry
  if (cache.size >= MAX_CACHE_SIZE) {
    const firstKey = cache.keys().next().value
    if (firstKey) cache.delete(firstKey)
  }
  cache.set(key, value)
}

async function fetchJson<T>(path: string): Promise<T> {
  if (cache.has(path)) return cache.get(path) as T
  
  const isServer = typeof window === "undefined"
  
  if (isServer) {
    // On server/prerender, use file:// URL to read from public directory
    const filePath = `file://${process.cwd()}/public/data${path}`
    const res = await fetch(filePath)
    if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status}`)
    const data = await res.json() as T
    cacheSet(path, data)
    return data
  }
  
  // Client-side fetch
  const res = await fetch(`/data${path}`)
  if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status}`)
  
  const data = await res.json()
  cacheSet(path, data)
  return data
}

// =============================================================================
// PUBLIC API
// =============================================================================

let indexCache: SiteIndex | null = null

export async function getIndex(): Promise<SiteIndex> {
  if (indexCache) return indexCache
  indexCache = await fetchJson<SiteIndex>("/index.json")
  return indexCache
}

export async function getVideos(options: {
  page?: number
  sort?: "date" | "oldest" | "views"
  category?: PlaylistCategory | "all" | "channel"
  playlistId?: string
}): Promise<VideoPage> {
  const { page = 1, sort = "date", category, playlistId } = options
  
  let path: string
  if (playlistId) {
    path = `/playlists/${playlistId}/${sort}/page-${page}.json`
  } else if (category && category !== "all" && category !== "channel") {
    path = `/categories/${encodeURIComponent(category)}/${sort}/page-${page}.json`
  } else {
    path = `/videos/${sort}/page-${page}.json`
  }
  
  try {
    return await fetchJson<VideoPage>(path)
  } catch {
    return { items: [], total: 0, page, pageSize: 24, totalPages: 0 }
  }
}

export async function getVideo(id: string): Promise<VideoDetails | null> {
  try {
    return await fetchJson<VideoDetails>(`/video/${id}.json`)
  } catch {
    return null
  }
}

// =============================================================================
// SEARCH
// =============================================================================

// Extended search entry with video summary data
interface SearchEntry {
  id: string
  t: string      // title
  c?: string     // category
  p?: string     // playlistId
  d?: string     // duration
  th?: string    // thumbnail
  vc?: string    // viewCount
  pa?: string    // publishedAt
  pn?: string    // playlistName
}

const searchCache = new Map<string, SearchEntry[]>()

async function getSearchEntries(category?: string, playlistId?: string): Promise<SearchEntry[]> {
  let path: string
  
  if (playlistId) {
    path = `/search/playlist/${playlistId}.json`
  } else if (category && category !== "all" && category !== "channel") {
    path = `/search/category/${encodeURIComponent(category)}.json`
  } else {
    // Load all chunks for global search
    const manifest = await fetchJson<{ totalChunks: number }>("/search/manifest.json")
    const key = "__all__"
    
    if (!searchCache.has(key)) {
      const entries: SearchEntry[] = []
      for (let i = 1; i <= manifest.totalChunks; i++) {
        const chunk = await fetchJson<{ entries: SearchEntry[] }>(`/search/chunk-${i}.json`)
        entries.push(...chunk.entries)
      }
      searchCache.set(key, entries)
    }
    return searchCache.get(key)!
  }
  
  if (!searchCache.has(path)) {
    try {
      const entries = await fetchJson<SearchEntry[]>(path)
      searchCache.set(path, entries)
    } catch {
      return []
    }
  }
  return searchCache.get(path)!
}

export async function search(
  query: string,
  options?: {
    category?: string
    playlistId?: string
    page?: number
    pageSize?: number
  }
): Promise<VideoPage> {
  const { category, playlistId, page = 1, pageSize = 24 } = options || {}
  
  if (!query.trim()) {
    return { items: [], total: 0, page, pageSize, totalPages: 0 }
  }
  
  const entries = await getSearchEntries(category, playlistId)
  const q = query.toLowerCase()
  const matches = entries.filter(e => e.t.toLowerCase().includes(q))
  
  const total = matches.length
  const totalPages = Math.ceil(total / pageSize)
  const start = (page - 1) * pageSize
  const pageMatches = matches.slice(start, start + pageSize)
  
  // Convert search entries directly to Video objects (no extra fetches!)
  const items: Video[] = pageMatches.map(m => ({
    id: m.id,
    title: m.t,
    publishedAt: m.pa || "",
    duration: m.d || "",
    thumbnail: m.th || "",
    viewCount: m.vc || "0",
    playlistId: m.p,
    playlistName: m.pn,
    category: m.c,
  }))
  
  return {
    items,
    total,
    page,
    pageSize,
    totalPages,
  }
}

// =============================================================================
// COMPOSITE LOADERS
// =============================================================================

export interface StudyHomeData {
  index: SiteIndex
  videos: VideoPage
}

export async function loadStudyHome(options: {
  page?: number
  sort?: "date" | "oldest" | "views"
  category?: PlaylistCategory | "all" | "channel"
  playlistId?: string
}): Promise<StudyHomeData> {
  const [index, videos] = await Promise.all([
    getIndex(),
    getVideos(options),
  ])
  return { index, videos }
}

export interface VideoPageData {
  video: VideoDetails
  prevVideo: Video | null
  nextVideo: Video | null
  playlistName: string
  playlistVideoCount: number
  currentIndex: number
}

export async function loadVideoPage(videoId: string): Promise<VideoPageData | null> {
  const video = await getVideo(videoId)
  if (!video) return null
  
  const [prevVideo, nextVideo] = await Promise.all([
    video.nav.prev ? getVideo(video.nav.prev).then(v => v ? {
      id: v.id, title: v.title, publishedAt: v.publishedAt, duration: v.duration,
      thumbnail: v.thumbnail, viewCount: v.viewCount, playlistId: v.playlistId,
      playlistName: v.playlistName, category: v.category,
    } : null) : Promise.resolve(null),
    video.nav.next ? getVideo(video.nav.next).then(v => v ? {
      id: v.id, title: v.title, publishedAt: v.publishedAt, duration: v.duration,
      thumbnail: v.thumbnail, viewCount: v.viewCount, playlistId: v.playlistId,
      playlistName: v.playlistName, category: v.category,
    } : null) : Promise.resolve(null),
  ])
  
  return {
    video,
    prevVideo,
    nextVideo,
    playlistName: video.playlistName || "دروس متنوعة",
    playlistVideoCount: video.nav.total,
    currentIndex: video.nav.index,
  }
}
