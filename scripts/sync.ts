/**
 * YouTube Sync & Static Data Generator
 * 
 * Single script that:
 * 1. Checks for new/updated content from YouTube
 * 2. Fetches only what's changed
 * 3. Generates optimized static JSON files
 * 
 * Usage: pnpm sync
 */

import * as fs from "node:fs"
import * as path from "node:path"

// =============================================================================
// CONFIG
// =============================================================================

const YOUTUBE_API = "https://www.googleapis.com/youtube/v3"
const CHANNEL_ID = "UCHUZYEvS7utmviL1C3EYrwA"
const OUTPUT_DIR = path.join(process.cwd(), "public", "data")
const PAGE_SIZE = 24

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  "تصوف": ["تصوف", "صوفي", "الحضرة", "الأوراد", "ذكر", "مجلس"],
  "فقه": ["فقه", "الفقه", "شافعي", "حنفي", "مالكي", "حنبلي", "أحكام"],
  "تفسير": ["تفسير", "القرآن", "سورة", "آية"],
  "حديث": ["حديث", "البخاري", "مسلم", "الأربعين", "النووي"],
  "عقيدة": ["عقيدة", "توحيد", "إيمان", "أشعري"],
  "سيرة": ["سيرة", "النبي", "الرسول", "محمد"],
  "ردود": ["رد", "ردود", "شبه", "دفاع"],
  "صلوات": ["صلوات", "صلاة", "صلى"],
  "خطب": ["خطبة", "خطب", "جمعة"],
  "متنوع": [],
}

// =============================================================================
// TYPES
// =============================================================================

interface Video {
  id: string
  title: string
  description: string
  publishedAt: string
  duration: string
  thumbnail: string
  viewCount: string
  likeCount?: string
  commentCount?: string
  tags?: string[]
  playlistId?: string
  playlistName?: string
  category?: string
}

interface Playlist {
  id: string
  name: string
  description: string
  videoCount: number
  category: string
}

interface SyncState {
  lastSync: string
  videoCount: number
  playlistCount: number
  latestVideoDate: string
  playlistEtags: Record<string, string>
}

// =============================================================================
// YOUTUBE API
// =============================================================================

function getApiKey(): string | null {
  return process.env.YOUTUBE_API_KEY || null
}

async function ytFetch<T>(endpoint: string, params: Record<string, string>): Promise<T> {
  const key = getApiKey()
  if (!key) throw new Error("YOUTUBE_API_KEY not set")
  
  const url = new URL(`${YOUTUBE_API}/${endpoint}`)
  url.searchParams.set("key", key)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  
  const res = await fetch(url.toString())
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`YouTube API ${endpoint}: ${res.status} - ${JSON.stringify(err)}`)
  }
  return res.json()
}

async function fetchAllPlaylists(): Promise<Playlist[]> {
  const playlists: Playlist[] = []
  let pageToken: string | undefined
  
  do {
    const params: Record<string, string> = {
      part: "snippet,contentDetails",
      channelId: CHANNEL_ID,
      maxResults: "50",
    }
    if (pageToken) params.pageToken = pageToken
    
    const res = await ytFetch<any>("playlists", params)
    
    for (const item of res.items || []) {
      playlists.push({
        id: item.id,
        name: item.snippet.title,
        description: item.snippet.description,
        videoCount: item.contentDetails.itemCount,
        category: inferCategory(item.snippet.title),
      })
    }
    pageToken = res.nextPageToken
  } while (pageToken)
  
  return playlists
}

async function fetchPlaylistVideoIds(playlistId: string): Promise<string[]> {
  const ids: string[] = []
  let pageToken: string | undefined
  
  do {
    const params: Record<string, string> = {
      part: "contentDetails",
      playlistId,
      maxResults: "50",
    }
    if (pageToken) params.pageToken = pageToken
    
    const res = await ytFetch<any>("playlistItems", params)
    for (const item of res.items || []) {
      if (item.contentDetails?.videoId) {
        ids.push(item.contentDetails.videoId)
      }
    }
    pageToken = res.nextPageToken
  } while (pageToken)
  
  return ids
}

async function fetchVideoDetails(videoIds: string[]): Promise<Video[]> {
  const videos: Video[] = []
  
  // Batch in groups of 50
  for (let i = 0; i < videoIds.length; i += 50) {
    const batch = videoIds.slice(i, i + 50)
    const res = await ytFetch<any>("videos", {
      part: "snippet,contentDetails,statistics",
      id: batch.join(","),
    })
    
    for (const item of res.items || []) {
      videos.push({
        id: item.id,
        title: item.snippet.title,
        description: item.snippet.description,
        publishedAt: item.snippet.publishedAt,
        duration: item.contentDetails.duration,
        thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url || "",
        viewCount: item.statistics.viewCount || "0",
        likeCount: item.statistics.likeCount,
        commentCount: item.statistics.commentCount,
        tags: item.snippet.tags,
      })
    }
  }
  
  return videos
}

async function fetchRecentVideoIds(limit = 50): Promise<{ id: string; publishedAt: string }[]> {
  // Get channel's uploads playlist
  const channelRes = await ytFetch<any>("channels", {
    part: "contentDetails",
    id: CHANNEL_ID,
  })
  const uploadsPlaylistId = channelRes.items?.[0]?.contentDetails?.relatedPlaylists?.uploads
  if (!uploadsPlaylistId) throw new Error("Could not find uploads playlist")
  
  const res = await ytFetch<any>("playlistItems", {
    part: "contentDetails,snippet",
    playlistId: uploadsPlaylistId,
    maxResults: limit.toString(),
  })
  
  return (res.items || []).map((item: any) => ({
    id: item.contentDetails.videoId,
    publishedAt: item.contentDetails.videoPublishedAt || item.snippet.publishedAt,
  }))
}

// =============================================================================
// HELPERS
// =============================================================================

function inferCategory(title: string): string {
  const lower = title.toLowerCase()
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(k => lower.includes(k.toLowerCase()))) {
      return cat
    }
  }
  return "متنوع"
}

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

function writeJson(filePath: string, data: unknown) {
  ensureDir(path.dirname(filePath))
  fs.writeFileSync(filePath, JSON.stringify(data), "utf-8")
}

function readJson<T>(filePath: string): T | null {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"))
  } catch {
    return null
  }
}

function clearDir(dir: string) {
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true })
  ensureDir(dir)
}

// =============================================================================
// SYNC LOGIC
// =============================================================================

async function loadExistingState(): Promise<{ state: SyncState | null; videos: Video[]; playlists: Playlist[] }> {
  const state = readJson<SyncState>(path.join(OUTPUT_DIR, "_sync.json"))
  
  // Load existing videos from page files
  const videos: Video[] = []
  const videosDir = path.join(OUTPUT_DIR, "videos", "date")
  
  if (fs.existsSync(videosDir)) {
    const files = fs.readdirSync(videosDir).filter(f => f.startsWith("page-"))
    for (const file of files) {
      const page = readJson<{ items: any[] }>(path.join(videosDir, file))
      if (page?.items) {
        for (const item of page.items) {
          // Convert old thumbnails format to new thumbnail string
          const thumbnail = typeof item.thumbnail === 'string' 
            ? item.thumbnail 
            : item.thumbnails?.medium?.url || item.thumbnails?.default?.url || ""
          
          videos.push({
            ...item,
            thumbnail,
            description: "", // Not stored in page files, loaded from individual video files if needed
          })
        }
      }
    }
  }
  
  // Load playlists from index
  const index = readJson<{ playlists: Playlist[] }>(path.join(OUTPUT_DIR, "index.json"))
  const playlists = index?.playlists?.map(p => ({
    ...p,
    description: "",
  })) || []
  
  return { state, videos, playlists }
}

async function sync() {
  console.log("\n🔄 Starting YouTube sync...\n")
  const startTime = Date.now()
  
  const { state: existingState, videos: existingVideos, playlists: existingPlaylists } = await loadExistingState()
  
  const hasApiKey = !!getApiKey()
  
  // If no API key and we have existing data, just regenerate static files
  if (!hasApiKey) {
    if (existingVideos.length === 0) {
      console.log("❌ No API key and no existing data to regenerate")
      process.exit(1)
    }
    console.log("⚠️  No YOUTUBE_API_KEY set, regenerating from existing data...")
    console.log(`   Found ${existingVideos.length} videos, ${existingPlaylists.length} playlists\n`)
    
    await generateStaticFiles(existingVideos, existingPlaylists)
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(1)
    console.log(`\n✅ Regeneration complete in ${duration}s\n`)
    return
  }
  
  // Step 1: Fetch playlists
  console.log("📋 Fetching playlists...")
  const playlists = await fetchAllPlaylists()
  console.log(`   Found ${playlists.length} playlists`)
  
  // Step 2: Determine what needs updating
  let needsFullSync = !existingState || existingState.playlistCount !== playlists.length
  let newVideoIds: string[] = []
  
  const existingVideoMap = new Map(existingVideos.map(v => [v.id, v]))
  
  if (!needsFullSync && existingState) {
    // Check for new videos since last sync
    console.log("🔍 Checking for new videos...")
    const recent = await fetchRecentVideoIds(100)
    newVideoIds = recent
      .filter(v => new Date(v.publishedAt) > new Date(existingState.latestVideoDate))
      .map(v => v.id)
    
    if (newVideoIds.length > 0) {
      console.log(`   Found ${newVideoIds.length} new videos`)
    } else {
      console.log("   No new videos found")
    }
  }
  
  // Step 3: Fetch video data
  let allVideos: Video[]
  
  if (needsFullSync) {
    console.log("📥 Full sync required, fetching all videos...")
    
    // Collect all video IDs from playlists
    const videoPlaylistMap = new Map<string, { playlistId: string; playlistName: string; category: string }>()
    const allVideoIds = new Set<string>()
    
    for (const playlist of playlists) {
      process.stdout.write(`   Playlist: ${playlist.name.slice(0, 40)}...`)
      const ids = await fetchPlaylistVideoIds(playlist.id)
      console.log(` (${ids.length} videos)`)
      
      for (const id of ids) {
        allVideoIds.add(id)
        videoPlaylistMap.set(id, {
          playlistId: playlist.id,
          playlistName: playlist.name,
          category: playlist.category,
        })
      }
    }
    
    console.log(`\n📹 Fetching details for ${allVideoIds.size} videos...`)
    const videos = await fetchVideoDetails([...allVideoIds])
    
    // Attach playlist info
    allVideos = videos.map(v => ({
      ...v,
      ...videoPlaylistMap.get(v.id),
    }))
  } else if (newVideoIds.length > 0) {
    console.log("📥 Incremental sync, fetching new videos...")
    
    // Get playlist mapping for new videos
    const videoPlaylistMap = new Map<string, { playlistId: string; playlistName: string; category: string }>()
    
    for (const playlist of playlists) {
      const ids = await fetchPlaylistVideoIds(playlist.id)
      for (const id of newVideoIds) {
        if (ids.includes(id)) {
          videoPlaylistMap.set(id, {
            playlistId: playlist.id,
            playlistName: playlist.name,
            category: playlist.category,
          })
        }
      }
    }
    
    const newVideos = await fetchVideoDetails(newVideoIds)
    const newVideosWithPlaylist = newVideos.map(v => ({
      ...v,
      ...videoPlaylistMap.get(v.id),
    }))
    
    // Merge with existing
    allVideos = [...newVideosWithPlaylist, ...existingVideos]
  } else {
    // No changes, use existing
    allVideos = existingVideos
  }
  
  // Sort by date (newest first)
  allVideos.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
  
  // Step 4: Generate static files
  console.log("\n📦 Generating static files...")
  await generateStaticFiles(allVideos, playlists)
  
  // Step 5: Save sync state
  const newState: SyncState = {
    lastSync: new Date().toISOString(),
    videoCount: allVideos.length,
    playlistCount: playlists.length,
    latestVideoDate: allVideos[0]?.publishedAt || new Date().toISOString(),
    playlistEtags: {},
  }
  writeJson(path.join(OUTPUT_DIR, "_sync.json"), newState)
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(1)
  console.log(`\n✅ Sync complete in ${duration}s`)
  console.log(`   ${playlists.length} playlists, ${allVideos.length} videos\n`)
}

// =============================================================================
// STATIC FILE GENERATION
// =============================================================================

async function generateStaticFiles(videos: Video[], playlists: Playlist[]) {
  // Prepare sort variations
  const byDate = [...videos]
  const byOldest = [...videos].sort((a, b) => 
    new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime()
  )
  const byViews = [...videos].sort((a, b) => 
    parseInt(b.viewCount || "0") - parseInt(a.viewCount || "0")
  )
  
  const categories = [...new Set(playlists.map(p => p.category))]
  
  // Filter playlists that actually have videos (handle deleted/private videos)
  const playlistsWithVideos = playlists.filter(p => 
    videos.some(v => v.playlistId === p.id)
  )
  
  // Update video counts to reflect actual available videos
  const playlistVideoCounts = new Map<string, number>()
  for (const p of playlists) {
    playlistVideoCounts.set(p.id, videos.filter(v => v.playlistId === p.id).length)
  }
  
  // 1. Index file
  console.log("   → index.json")
  writeJson(path.join(OUTPUT_DIR, "index.json"), {
    stats: {
      totalVideos: videos.length,
      totalPlaylists: playlistsWithVideos.length,
      categoriesCount: categories.length,
      lastUpdated: new Date().toISOString(),
    },
    categories,
    playlists: playlists.map(p => ({
      id: p.id,
      name: p.name,
      category: p.category,
      videoCount: playlistVideoCounts.get(p.id) || 0,
    })),
    pagination: {
      all: Math.ceil(videos.length / PAGE_SIZE),
      byCategory: Object.fromEntries(
        categories.map(c => [c, Math.ceil(videos.filter(v => v.category === c).length / PAGE_SIZE)])
      ),
      byPlaylist: Object.fromEntries(
        playlists.map(p => [p.id, Math.ceil((playlistVideoCounts.get(p.id) || 0) / PAGE_SIZE)])
      ),
    },
  })
  
  // 2. Video pages (all, by category, by playlist) × (date, oldest, views)
  const sortVariants = [
    { name: "date", data: byDate },
    { name: "oldest", data: byOldest },
    { name: "views", data: byViews },
  ]
  
  for (const { name: sort, data } of sortVariants) {
    // All videos
    generatePages(data, path.join(OUTPUT_DIR, "videos", sort), `   → videos/${sort}`)
    
    // By category
    for (const cat of categories) {
      const filtered = data.filter(v => v.category === cat)
      if (filtered.length > 0) {
        generatePages(filtered, path.join(OUTPUT_DIR, "categories", encodeURIComponent(cat), sort))
      }
    }
    
    // By playlist
    for (const playlist of playlists) {
      const filtered = data.filter(v => v.playlistId === playlist.id)
      if (filtered.length > 0) {
        generatePages(filtered, path.join(OUTPUT_DIR, "playlists", playlist.id, sort))
      }
    }
  }
  
  // 3. Individual video files with nav
  console.log("   → video/*.json")
  const playlistVideoMap = new Map<string, Video[]>()
  for (const v of byDate) {
    if (v.playlistId) {
      if (!playlistVideoMap.has(v.playlistId)) playlistVideoMap.set(v.playlistId, [])
      playlistVideoMap.get(v.playlistId)!.push(v)
    }
  }
  // Sort playlist videos by date ascending for sequential order
  for (const vids of playlistVideoMap.values()) {
    vids.sort((a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime())
  }
  
  for (const video of videos) {
    const playlistVideos = video.playlistId ? playlistVideoMap.get(video.playlistId) || [] : []
    const idx = playlistVideos.findIndex(v => v.id === video.id)
    
    writeJson(path.join(OUTPUT_DIR, "video", `${video.id}.json`), {
      ...video,
      nav: {
        prev: idx > 0 ? playlistVideos[idx - 1].id : null,
        next: idx < playlistVideos.length - 1 ? playlistVideos[idx + 1].id : null,
        index: idx + 1,
        total: playlistVideos.length,
      },
    })
  }
  
  // 4. Search index (chunked) - with video summaries for efficient search results
  console.log("   → search/")
  const CHUNK_SIZE = 500
  const chunks = Math.ceil(videos.length / CHUNK_SIZE)
  
  writeJson(path.join(OUTPUT_DIR, "search", "manifest.json"), {
    totalVideos: videos.length,
    totalChunks: chunks,
    chunkSize: CHUNK_SIZE,
  })
  
  for (let i = 0; i < chunks; i++) {
    const chunk = byDate.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE)
    writeJson(path.join(OUTPUT_DIR, "search", `chunk-${i + 1}.json`), {
      entries: chunk.map(v => ({
        id: v.id,
        t: v.title,
        c: v.category,
        p: v.playlistId,
        // Include summary data for search results (avoids N+1 fetches)
        d: v.duration,
        th: v.thumbnail,
        vc: v.viewCount,
        pa: v.publishedAt,
        pn: v.playlistName,
      })),
    })
  }
  
  // Category-specific search (with summaries)
  for (const cat of categories) {
    const filtered = byDate.filter(v => v.category === cat)
    writeJson(
      path.join(OUTPUT_DIR, "search", "category", `${encodeURIComponent(cat)}.json`),
      filtered.map(v => ({
        id: v.id,
        t: v.title,
        d: v.duration,
        th: v.thumbnail,
        vc: v.viewCount,
        pa: v.publishedAt,
        p: v.playlistId,
        pn: v.playlistName,
      }))
    )
  }
  
  // Playlist-specific search (with summaries)
  for (const playlist of playlists) {
    const filtered = byDate.filter(v => v.playlistId === playlist.id)
    if (filtered.length > 0) {
      writeJson(
        path.join(OUTPUT_DIR, "search", "playlist", `${playlist.id}.json`),
        filtered.map(v => ({
          id: v.id,
          t: v.title,
          d: v.duration,
          th: v.thumbnail,
          vc: v.viewCount,
          pa: v.publishedAt,
        }))
      )
    }
  }
}

function generatePages(videos: Video[], dir: string, label?: string) {
  if (label) console.log(label)
  const totalPages = Math.ceil(videos.length / PAGE_SIZE)
  
  for (let page = 1; page <= totalPages; page++) {
    const start = (page - 1) * PAGE_SIZE
    const items = videos.slice(start, start + PAGE_SIZE).map(v => ({
      id: v.id,
      title: v.title,
      publishedAt: v.publishedAt,
      duration: v.duration,
      thumbnail: v.thumbnail,
      viewCount: v.viewCount,
      playlistId: v.playlistId,
      playlistName: v.playlistName,
      category: v.category,
    }))
    
    writeJson(path.join(dir, `page-${page}.json`), {
      items,
      total: videos.length,
      page,
      pageSize: PAGE_SIZE,
      totalPages,
    })
  }
}

// =============================================================================
// RUN
// =============================================================================

sync().catch(err => {
  console.error("❌ Sync failed:", err)
  process.exit(1)
})
