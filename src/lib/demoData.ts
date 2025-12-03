/**
 * ===============================================
 * DEMO DATA FOR VIDEO STUDY APP
 * ===============================================
 * Placeholder data for development/demo purposes.
 * Replace with actual API calls when ready.
 * ===============================================
 */

import type { PlaylistWithVideos, VideoWithContext } from "./types";

// Demo videos data
export const demoVideos: VideoWithContext[] = [
  {
    id: "EcVm9Ws6f9o",
    title: "الحَضْرَةُ الصِّدِّيقِيَّة  أ.د يسري جبر",
    description: "شرح الحضرة الصديقية للإمام أبي بكر الصديق رضي الله عنه",
    url: "https://www.youtube.com/watch?v=EcVm9Ws6f9o",
    publishedAt: "2018-03-17T10:05:53Z",
    duration: "PT36M27S",
    channelId: "UCHUZYEvS7utmviL1C3EYrwA",
    channelTitle: "Dr. Yosry Gabr أ.د. يسري جبر",
    thumbnails: {
      default: { url: "https://i.ytimg.com/vi/EcVm9Ws6f9o/default.jpg", width: 120, height: 90 },
      medium: { url: "https://i.ytimg.com/vi/EcVm9Ws6f9o/mqdefault.jpg", width: 320, height: 180 },
      high: { url: "https://i.ytimg.com/vi/EcVm9Ws6f9o/hqdefault.jpg", width: 480, height: 360 },
    },
    viewCount: "17880",
    likeCount: "515",
    commentCount: "44",
    playlistId: "tasawwuf",
    playlistName: "دروس التصوف",
    category: "تصوف",
  },
  {
    id: "k3fD7GxUVAw",
    title: "مجلس اللطيفية بصوت د.يسري جبر",
    description: "مجلس اللطيفية | أ.د. يسري جبر\n#يسري_جبر #اذكار",
    url: "https://www.youtube.com/watch?v=k3fD7GxUVAw",
    publishedAt: "2024-06-23T18:09:40Z",
    duration: "PT26M25S",
    channelId: "UCHUZYEvS7utmviL1C3EYrwA",
    channelTitle: "Dr. Yosry Gabr أ.د. يسري جبر",
    thumbnails: {
      default: { url: "https://i.ytimg.com/vi/k3fD7GxUVAw/default.jpg", width: 120, height: 90 },
      medium: { url: "https://i.ytimg.com/vi/k3fD7GxUVAw/mqdefault.jpg", width: 320, height: 180 },
      high: { url: "https://i.ytimg.com/vi/k3fD7GxUVAw/hqdefault.jpg", width: 480, height: 360 },
    },
    viewCount: "7628",
    likeCount: "427",
    commentCount: "30",
    playlistId: "tasawwuf",
    playlistName: "دروس التصوف",
    category: "تصوف",
  },
  {
    id: "rJsuWne5-FE",
    title: "الحضرة الصديقية",
    description: "الحضرة الصديقية",
    url: "https://www.youtube.com/watch?v=rJsuWne5-FE",
    publishedAt: "2025-01-24T10:30:25Z",
    duration: "PT41M16S",
    channelId: "UCHUZYEvS7utmviL1C3EYrwA",
    channelTitle: "Dr. Yosry Gabr أ.د. يسري جبر",
    thumbnails: {
      default: { url: "https://i.ytimg.com/vi/rJsuWne5-FE/default.jpg", width: 120, height: 90 },
      medium: { url: "https://i.ytimg.com/vi/rJsuWne5-FE/mqdefault.jpg", width: 320, height: 180 },
      high: { url: "https://i.ytimg.com/vi/rJsuWne5-FE/hqdefault.jpg", width: 480, height: 360 },
    },
    viewCount: "2116",
    likeCount: "140",
    commentCount: "23",
    playlistId: "tasawwuf",
    playlistName: "دروس التصوف",
    category: "تصوف",
  },
  {
    id: "abc123def",
    title: "شرح صحيح البخاري - الدرس الأول",
    description: "بداية شرح صحيح البخاري",
    url: "https://www.youtube.com/watch?v=abc123def",
    publishedAt: "2023-05-10T14:00:00Z",
    duration: "PT55M10S",
    channelId: "UCHUZYEvS7utmviL1C3EYrwA",
    channelTitle: "Dr. Yosry Gabr أ.د. يسري جبر",
    thumbnails: {
      default: { url: "https://placehold.co/120x90/047857/white?text=Hadith", width: 120, height: 90 },
      medium: { url: "https://placehold.co/320x180/047857/white?text=Hadith", width: 320, height: 180 },
      high: { url: "https://placehold.co/480x360/047857/white?text=Hadith", width: 480, height: 360 },
    },
    viewCount: "5000",
    likeCount: "300",
    commentCount: "20",
    playlistId: "hadith",
    playlistName: "شرح صحيح البخاري",
    category: "حديث",
  },
];

// Demo playlists
export const demoPlaylists = [
  {
    id: "tasawwuf",
    name: "دروس التصوف",
    category: "تصوف" as const,
    videoIds: ["EcVm9Ws6f9o", "k3fD7GxUVAw", "rJsuWne5-FE"],
  },
  {
    id: "hadith",
    name: "شرح صحيح البخاري",
    category: "حديث" as const,
    videoIds: ["abc123def"],
  },
];

// Demo playlists
export const demoPlaylistsWithVideos: PlaylistWithVideos[] = [
  {
    id: "tasawwuf",
    name: "دروس التصوف",
    category: "تصوف" as const,
    videos: demoVideos
  },
  {
    id: "hadith",
    name: "شرح صحيح البخاري",
    category: "حديث" as const,
    videos: demoVideos
  },
];

// ===============================================
// DATA FETCHING FUNCTIONS (simulate async)
// ===============================================

/**
 * Get a video by ID with its playlist context
 */
export async function getVideoById(videoId: string): Promise<VideoWithContext | null> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  const video = demoVideos.find((v) => v.id === videoId);
  return video || null;
}

/**
 * Get video with navigation context (prev/next in playlist)
 */
export interface VideoPageData {
  video: VideoWithContext;
  prevVideo: VideoWithContext | null;
  nextVideo: VideoWithContext | null;
  playlistName: string;
}

export async function getVideoPageData(videoId: string): Promise<VideoPageData | null> {
  const video = await getVideoById(videoId);
  if (!video) return null;

  // Find playlist videos
  const playlist = demoPlaylists.find((p) => p.id === video.playlistId);
  const playlistVideos = playlist
    ? demoVideos.filter((v) => playlist.videoIds.includes(v.id))
    : [];

  // Find prev/next
  const currentIndex = playlistVideos.findIndex((v) => v.id === videoId);
  const prevVideo = currentIndex > 0 ? playlistVideos[currentIndex - 1] : null;
  const nextVideo = currentIndex < playlistVideos.length - 1 ? playlistVideos[currentIndex + 1] : null;

  return {
    video,
    prevVideo,
    nextVideo,
    playlistName: video.playlistName || "دروس متنوعة",
  };
}

/**
 * Get all videos (for listing)
 */
export async function getAllVideos(): Promise<VideoWithContext[]> {
  await new Promise((resolve) => setTimeout(resolve, 50));
  return demoVideos;
}

/**
 * Get videos by playlist
 */
export async function getVideosByPlaylist(playlistId: string): Promise<VideoWithContext[]> {
  await new Promise((resolve) => setTimeout(resolve, 50));
  const playlist = demoPlaylists.find((p) => p.id === playlistId);
  if (!playlist) return [];
  return demoVideos.filter((v) => playlist.videoIds.includes(v.id));
}
