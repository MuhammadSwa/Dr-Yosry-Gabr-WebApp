import { Show, For } from "solid-js";
import { Link } from "@tanstack/solid-router";
import type { VideoDetails, Video } from "../../lib/staticData";
import VideoStudy from "./VideoStudy";
import YouTubePlayer from "./YouTubePlayer";
import VideoActions from "./VideoActions";
import KeyboardShortcuts from "./KeyboardShortcuts";
import FocusTimer from "./FocusTimer";

export interface VideoPageProps {
  video: VideoDetails;
  prevVideo?: Video | null;
  nextVideo?: Video | null;
  playlistName?: string;
  playlistVideoCount?: number;
  currentIndex?: number;
}

// Helper function to parse ISO 8601 duration
function parseDuration(duration?: string): string {
  if (!duration) return "";
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return duration;

  const hours = match[1] ? parseInt(match[1]) : 0;
  const minutes = match[2] ? parseInt(match[2]) : 0;
  const seconds = match[3] ? parseInt(match[3]) : 0;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function formatViews(views?: string): string {
  if (!views) return "";
  const num = parseInt(views);
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return views;
}

function formatDate(date: string): string {
  const d = new Date(date);
  return d.toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function VideoPage(props: VideoPageProps) {
  // Serialize video data for the VideoStudy component
  const videoData = props.video;

  return (
    <div class="min-h-screen bg-emerald-950 pt-20">
      <div class="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div class="flex items-center gap-4">
            <Link
              to="/study"
              class="inline-flex items-center gap-2 text-emerald-300 hover:text-amber-400 transition-colors"
            >
              <svg class="w-5 h-5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
              الدروس
            </Link>
            <a
              href="/dashboard"
              class="inline-flex items-center gap-2 text-emerald-300 hover:text-amber-400 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              لوحة التحكم
            </a>
          </div>

          {/* Video Actions */}
          <VideoActions
            videoId={props.video.id}
            videoTitle={props.video.title}
            thumbnail={props.video.thumbnail}
          />
        </div>

        <div class="grid lg:grid-cols-3 gap-8">
          {/* Video Player Section */}
          <div class="lg:col-span-2">
            {/* Video Embed */}
            <div class="rounded-2xl overflow-hidden shadow-2xl shadow-black/30 mb-6">
              <YouTubePlayer
                videoId={props.video.id}
                title={props.video.title}
              />
            </div>

            {/* Video Info */}
            <div class="bg-emerald-900/50 rounded-2xl p-6 border border-emerald-700/50">
              <h1 class="text-2xl md:text-3xl font-bold text-amber-400 mb-4 font-cairo">
                {props.video.title}
              </h1>

              {/* Metadata */}
              <div class="flex flex-wrap gap-4 text-emerald-300 text-sm mb-6">
                <span class="flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {formatDate(props.video.publishedAt)}
                </span>
                <Show when={props.video.viewCount}>
                  <span class="flex items-center gap-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    {formatViews(props.video.viewCount)} مشاهدة
                  </span>
                </Show>
                <Show when={props.video.likeCount}>
                  <span class="flex items-center gap-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                    {formatViews(props.video.likeCount)}
                  </span>
                </Show>
                <Show when={props.video.duration}>
                  <span class="flex items-center gap-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {parseDuration(props.video.duration)}
                  </span>
                </Show>
              </div>

              {/* Channel Info */}
              <div class="flex items-center gap-3 mb-6 pb-6 border-b border-emerald-700/50">
                <div class="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center text-emerald-950 font-bold text-lg">
                  د
                </div>
                <div>
                  <div class="font-bold text-emerald-50">د. يسري جبر</div>
                  <a
                    href={`https://www.youtube.com/watch?v=${props.video.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-sm text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    شاهد على YouTube ↗
                  </a>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 class="text-lg font-bold text-emerald-200 mb-3">الوصف</h3>
                <p class="text-emerald-300 whitespace-pre-wrap leading-relaxed text-sm">
                  {props.video.description || "لا يوجد وصف متاح"}
                </p>
              </div>

              {/* Tags */}
              <Show when={props.video.tags && props.video.tags.length > 0}>
                <div class="mt-6 pt-6 border-t border-emerald-700/50">
                  <h3 class="text-lg font-bold text-emerald-200 mb-3">الوسوم</h3>
                  <div class="flex flex-wrap gap-2">
                    <For each={props.video.tags}>
                      {(tag) => (
                        <span class="bg-emerald-800/50 text-emerald-300 px-3 py-1 rounded-full text-sm">
                          {tag}
                        </span>
                      )}
                    </For>
                  </div>
                </div>
              </Show>
            </div>

            {/* Playlist Navigation */}
            <Show when={props.prevVideo || props.nextVideo}>
              <div class="bg-emerald-900/50 rounded-2xl p-6 border border-emerald-700/50 mt-6">
                <Show when={props.playlistName}>
                  <div class="flex items-center gap-2 mb-4">
                    <svg class="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                    <h3 class="text-lg font-bold text-amber-400">
                      {props.playlistName}
                    </h3>
                  </div>
                </Show>

                <div class="grid sm:grid-cols-2 gap-4">
                  {/* Previous Video */}
                  <Show when={props.prevVideo} fallback={<div class="hidden sm:block"></div>}>
                    {(prevVideo) => (
                      <Link
                        to="/study/$id"
                        params={{ id: prevVideo().id }}
                        class="group flex gap-3 p-3 bg-emerald-800/30 rounded-xl border border-emerald-700/30 hover:border-amber-500/50 hover:bg-emerald-800/50 transition-all text-right"
                      >
                        <div class="flex-shrink-0 w-24 h-14 rounded-lg overflow-hidden bg-emerald-800">
                          <img
                            src={prevVideo().thumbnail}
                            alt={prevVideo().title}
                            class="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div class="flex-1 min-w-0">
                          <div class="flex items-center gap-1 text-emerald-400 text-xs mb-1">
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                            </svg>
                            الدرس السابق
                          </div>
                          <p class="text-emerald-100 text-sm font-medium line-clamp-2 group-hover:text-amber-400 transition-colors">
                            {prevVideo().title}
                          </p>
                        </div>
                      </Link>
                    )}
                  </Show>

                  {/* Next Video */}
                  <Show when={props.nextVideo}>
                    {(nextVideo) => (
                      <Link
                        to="/study/$id"
                        params={{ id: nextVideo().id }}
                        class="group flex gap-3 p-3 bg-emerald-800/30 rounded-xl border border-emerald-700/30 hover:border-amber-500/50 hover:bg-emerald-800/50 transition-all text-right"
                      >
                        <div class="flex-shrink-0 w-24 h-14 rounded-lg overflow-hidden bg-emerald-800">
                          <img
                            src={nextVideo().thumbnail}
                            alt={nextVideo().title}
                            class="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div class="flex-1 min-w-0">
                          <div class="flex items-center gap-1 text-emerald-400 text-xs mb-1">
                            الدرس التالي
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                          <p class="text-emerald-100 text-sm font-medium line-clamp-2 group-hover:text-amber-400 transition-colors">
                            {nextVideo().title}
                          </p>
                        </div>
                      </Link>
                    )}
                  </Show>
                </div>
              </div>
            </Show>
          </div>

          {/* Study Tools Sidebar */}
          <div class="lg:col-span-1 space-y-6">
            <VideoStudy video={videoData} videoId={props.video.id} />
            <FocusTimer />
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Handler */}
      <KeyboardShortcuts videoId={props.video.id} />
    </div>
  );
}
