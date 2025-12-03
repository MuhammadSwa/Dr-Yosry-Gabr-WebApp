export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  duration?: string;
  channelId: string;
  channelTitle: string;
  thumbnails: {
    default?: { url: string; width?: number; height?: number };
    medium?: { url: string; width?: number; height?: number };
    high?: { url: string; width?: number; height?: number };
    standard?: { url: string; width?: number; height?: number };
    maxres?: { url: string; width?: number; height?: number };
  };
  tags?: string[];
  categoryId?: string;
  viewCount?: string;
  likeCount?: string;
  commentCount?: string;
  // Added: playlist context for videos
  playlistId?: string;
  playlistName?: string;
  category?: string;
}

// Extended video type with playlist context
export interface VideoWithContext extends YouTubeVideo {
  playlistId?: string;
  playlistName?: string;
  category?: PlaylistCategory;
}

export interface Playlist {
  id: string;
  name: string;
  category: PlaylistCategory;
  description?: string;
  /** If true, the playlist won't be refetched (no new videos expected) */
  isComplete?: boolean;
}

export type PlaylistCategory = "تصوف" | "فقه" | "تفسير" | "حديث" | "عقيدة" | "سيرة" | "متنوع" | "ردود" | "صلوات" | "خطب";

export interface PlaylistWithVideos extends Playlist {
  videos: VideoWithContext[];
}
