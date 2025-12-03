import { createFileRoute } from '@tanstack/solid-router'
import { For, Switch, Match } from "solid-js";
import { Link } from "@tanstack/solid-router";
import { DrYosryBio } from "../lib/data";
// Depending on your Vite config, this import gives you the URL string
import drYosryImage from "../assets/dr-yosry-bio-cover.jpg";

export const Route = createFileRoute('/biography')({
  component: BiographyPage,
})


// --- Data Parsing Logic ---
// We do this outside the component to avoid recalculating on every render
const bioSectionsRaw = DrYosryBio.split("##").filter((section) => section.trim());
const introText = bioSectionsRaw[0]?.trim() || "";

const contentSections = bioSectionsRaw.slice(1).map((section) => {
  const lines = section.trim().split("\n");
  const title = lines[0].trim();
  const content = lines.slice(1).join("\n").trim();
  return { title, content };
});

// --- Main Page Component ---
export default function BiographyPage() {
  return (
    <div class="min-h-screen bg-emerald-950">
      <BioHero image={drYosryImage} />

      <BioIntro text={introText} />

      <For each={contentSections}>
        {(section, index) => (
          <BioSection
            title={section.title}
            content={section.content}
            index={index()}
          />
        )}
      </For>

      <BioClosing />
    </div>
  );
}

// --- Sub-Components ---

function BioHero(props: { image: string }) {
  const badges = [
    'القاهري مولداً',
    'الحسني نسباً',
    'الشافعي مذهباً',
    'الصديقي طريقةً',
    'الأزهري إجازةً'
  ];

  return (
    <section class="pt-32 relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-gradient-to-l from-emerald-900 via-emerald-800 to-emerald-950">
      {/* Animated Background */}
      <div class="absolute inset-0 opacity-10">
        <svg class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="islamicPattern"
              x="0"
              y="0"
              width="100"
              height="100"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M50 0 L100 50 L50 100 L0 50 Z M25 25 L75 25 L75 75 L25 75 Z"
                fill="none"
                stroke="currentColor"
                stroke-width="0.5"
                class="text-amber-300"
              />
              <circle
                cx="50"
                cy="50"
                r="20"
                fill="none"
                stroke="currentColor"
                stroke-width="0.5"
                class="text-amber-300"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#islamicPattern)" />
        </svg>
      </div>

      {/* Floating Ornaments & Lights */}
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute top-10 right-10 w-32 h-32 border-4 border-amber-400/20 rounded-full animate-[spin_20s_linear_infinite]" />
        <div class="absolute bottom-20 left-20 w-24 h-24 border-4 border-emerald-400/20 rounded-full animate-pulse" />
        <div class="absolute top-1/4 left-0 w-[600px] h-[600px] bg-emerald-500/20 rounded-full blur-3xl -translate-x-1/2" />
        <div class="absolute bottom-1/4 right-0 w-[600px] h-[600px] bg-amber-500/20 rounded-full blur-3xl translate-x-1/2" />
      </div>

      <div class="container mx-auto px-6 relative z-10 py-16">
        <div class="grid lg:grid-cols-2 gap-16 xl:gap-20 items-center max-w-7xl mx-auto">
          {/* Text Content */}
          <div class="text-center lg:text-right order-2 lg:order-1 space-y-8">
            {/* Top Divider */}
            <div class="flex items-center justify-center lg:justify-end opacity-80">
              <div class="h-px w-24 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
              <svg
                class="w-8 h-8 mx-4 text-amber-400"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
              <div class="h-px w-24 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
            </div>

            <h1 class="text-4xl md:text-6xl lg:text-7xl font-bold text-white font-amiri leading-relaxed drop-shadow-2xl">
              السيرة الذاتية
            </h1>

            <div class="space-y-4">
              <h2 class="text-2xl md:text-3xl lg:text-4xl text-amber-300 font-amiri">
                فضيلة الدكتور
              </h2>
              <h3 class="text-3xl md:text-4xl lg:text-5xl text-amber-200 font-bold font-amiri">
                يسري رشدي السيد جبر
              </h3>
            </div>

            <div class="flex items-center justify-center lg:justify-end gap-3 text-emerald-200 text-base md:text-lg flex-wrap pt-4">
              <For each={badges}>
                {(badge) => (
                  <span class="px-4 py-2 justify-start bg-white/10 backdrop-blur-sm rounded-full border border-white/20 hover:bg-white/20 transition-colors">
                    {badge}
                  </span>
                )}
              </For>
            </div>
          </div>

          {/* Portrait Image */}
          <div class="order-1 lg:order-2">
            <div class="relative group max-w-lg mx-auto">
              <div class="relative bg-gradient-to-br from-amber-900/40 via-emerald-900/40 to-amber-900/40 backdrop-blur-sm p-8 rounded-3xl border-4 border-amber-500/30 shadow-2xl">
                {/* Corner Decorations */}
                <div class="absolute top-0 right-0 w-20 h-20 border-t-4 border-r-4 border-amber-400 rounded-tr-3xl" />
                <div class="absolute bottom-0 left-0 w-20 h-20 border-b-4 border-l-4 border-amber-400 rounded-bl-3xl" />

                <div class="relative overflow-hidden rounded-2xl shadow-2xl">
                  <img
                    src={props.image}
                    alt="فضيلة الدكتور يسري جبر"
                    class="w-full h-auto object-cover"
                  />
                  <div class="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div class="mt-16 animate-bounce text-center">
          <svg
            class="w-6 h-6 mx-auto text-amber-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </div>
    </section>
  );
}

function BioIntro(props: { text: string }) {
  return (
    <section class="py-20 relative overflow-hidden bg-gradient-to-l from-emerald-900 via-emerald-800 to-emerald-950">
      {/* Geometric Background Pattern */}
      <div class="absolute inset-0 opacity-30 pointer-events-none">
        <svg class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="introPattern"
              x="0"
              y="0"
              width="140"
              height="140"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M70 20 L80 50 L110 50 L85 68 L95 98 L70 80 L45 98 L55 68 L30 50 L60 50 Z"
                fill="none"
                stroke="currentColor"
                stroke-width="0.5"
                class="text-emerald-600"
              />
              <circle
                cx="70"
                cy="70"
                r="55"
                fill="none"
                stroke="currentColor"
                stroke-width="0.5"
                class="text-amber-600"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#introPattern)" />
        </svg>
      </div>

      <div class="container mx-auto px-6 relative z-10">
        <div class="max-w-4xl mx-auto text-center">
          {/* Gold Divider */}
          <div class="flex justify-center mb-12">
            <svg viewBox="0 0 400 40" class="w-full max-w-md h-auto">
              <path
                d="M0 20 Q100 0, 200 20 T400 20"
                stroke="url(#goldGradient)"
                stroke-width="2"
                fill="none"
              />
              <defs>
                <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style="stop-color:#d97706;stop-opacity:0.3" />
                  <stop offset="50%" style="stop-color:#d97706;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#d97706;stop-opacity:0.3" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div class="inline-block relative">
            <p class="relative text-2xl md:text-3xl font-amiri text-emerald-900 leading-relaxed p-10 bg-gradient-to-br from-white via-amber-50/80 to-emerald-50/80 backdrop-blur-sm rounded-2xl border-2 border-amber-300/40 shadow-xl">
              {props.text}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function BioSection(props: { title: string; content: string; index: number }) {
  const patternId = `pattern-${props.index}`;

  return (
    <section class="py-20 relative overflow-hidden bg-gradient-to-l from-emerald-900 via-emerald-800 to-emerald-950">
      {/* Dynamic Background Pattern */}
      <div class="absolute inset-0 opacity-30 pointer-events-none">
        <svg class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id={patternId}
              x="0"
              y="0"
              width="150"
              height="150"
              patternUnits="userSpaceOnUse"
            >
              <Switch>
                <Match when={props.index % 3 === 0}>
                  {/* Pattern 1: Mandala */}
                  <g>
                    <circle
                      cx="75"
                      cy="75"
                      r="60"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="0.5"
                      class="text-emerald-600"
                    />
                    <circle
                      cx="75"
                      cy="75"
                      r="45"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="0.5"
                      class="text-amber-600"
                    />
                    <path
                      d="M75 15 L75 135 M15 75 L135 75"
                      stroke="currentColor"
                      stroke-width="0.3"
                      class="text-emerald-500"
                    />
                  </g>
                </Match>
                <Match when={props.index % 3 === 1}>
                  {/* Pattern 2: Star */}
                  <g>
                    <path
                      d="M75 20 L85 55 L120 55 L92 75 L102 110 L75 90 L48 110 L58 75 L30 55 L65 55 Z"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="0.5"
                      class="text-amber-600"
                    />
                    <circle
                      cx="75"
                      cy="75"
                      r="50"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="0.5"
                      class="text-emerald-600"
                    />
                  </g>
                </Match>
                <Match when={props.index % 3 === 2}>
                  {/* Pattern 3: Flower */}
                  <g>
                    <circle
                      cx="75"
                      cy="75"
                      r="55"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="0.5"
                      class="text-emerald-600"
                    />
                    <circle
                      cx="75"
                      cy="30"
                      r="15"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="0.5"
                      class="text-amber-600"
                    />
                    <circle
                      cx="75"
                      cy="120"
                      r="15"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="0.5"
                      class="text-amber-600"
                    />
                  </g>
                </Match>
              </Switch>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#${patternId})`} />
        </svg>
      </div>

      <div class="container mx-auto px-6 relative z-10">
        <div class="max-w-5xl mx-auto">
          {/* Section Title */}
          <div class="text-center mb-12">
            <div class="inline-block relative group">
              {/* Top Ornament */}
              <div class="flex justify-center mb-3">
                <svg class="w-16 h-8" viewBox="0 0 100 50">
                  <path
                    d="M10 40 Q50 10, 90 40"
                    stroke="#d97706"
                    stroke-width="2"
                    fill="none"
                  />
                  <circle cx="50" cy="25" r="4" fill="#d97706" />
                </svg>
              </div>

              {/* Title with Gold Gradient */}
              <h2 class="text-4xl md:text-5xl font-bold font-amiri text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 px-8 py-2 drop-shadow-sm">
                {props.title}
              </h2>

              {/* Bottom Ornament */}
              <div class="flex justify-center mt-3">
                <svg class="w-16 h-8" viewBox="0 0 100 50">
                  <path
                    d="M10 10 Q50 40, 90 10"
                    stroke="#d97706"
                    stroke-width="2"
                    fill="none"
                  />
                  <circle cx="50" cy="25" r="4" fill="#d97706" />
                </svg>
              </div>
            </div>
          </div>

          {/* Content Card */}
          <div class="bg-white/80 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-xl border border-emerald-100/50 relative overflow-hidden">
            {/* Content Decorations */}
            <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-400/10 to-transparent rounded-bl-full pointer-events-none" />
            <div class="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-emerald-500/10 to-transparent rounded-tr-full pointer-events-none" />

            {/* Text */}
            <div class="relative font-amiri text-xl md:text-2xl leading-loose text-slate-800 space-y-6">
              <For each={props.content.split("\n\n")}>
                {(paragraph) => (
                  <p class="relative">
                    <span class="absolute -right-6 top-0 text-amber-500/30 text-3xl select-none">
                      ❖
                    </span>
                    {paragraph}
                  </p>
                )}
              </For>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BioClosing() {
  return (
    <section class="py-20 bg-gradient-to-l from-emerald-900 via-emerald-800 to-emerald-950 relative overflow-hidden">
      {/* Subtle Background */}
      <div class="absolute inset-0 opacity-10 pointer-events-none">
        <svg class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="closingPattern"
              x="0"
              y="0"
              width="100"
              height="100"
              patternUnits="userSpaceOnUse"
            >
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="currentColor"
                stroke-width="0.5"
                class="text-amber-300"
              />
              <path
                d="M50 10 L50 90 M10 50 L90 50"
                stroke="currentColor"
                stroke-width="0.3"
                class="text-amber-400"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#closingPattern)" />
        </svg>
      </div>

      <div class="container mx-auto px-6 relative z-10">
        <div class="max-w-4xl mx-auto text-center">
          {/* Top Border */}
          <div class="flex items-center justify-center mb-8">
            <div class="h-px w-32 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
            <div class="mx-4">
              <svg
                class="w-10 h-10 text-amber-400 animate-pulse"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
            </div>
            <div class="h-px w-32 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
          </div>

          {/* Dua Content */}
          <div class="bg-white/10 backdrop-blur-md rounded-3xl p-12 border border-white/20 shadow-2xl">
            <p class="text-3xl md:text-4xl font-amiri text-amber-200 leading-loose mb-8">
              والحمد لله على نعمة الإسلام
              <br />
              وكفى بها نعمة
            </p>

            <div class="h-px w-48 mx-auto bg-gradient-to-r from-transparent via-amber-400/50 to-transparent my-8" />

            <p class="text-2xl md:text-3xl font-amiri text-emerald-200 leading-relaxed">
              وصلى الله على سيدنا محمد
              <br />
              وعلى آله وسلم
            </p>
          </div>

          {/* Bottom Dots */}
          <div class="flex items-center justify-center mt-12 gap-2">
            <div class="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
            <div class="w-2 h-2 bg-amber-400 rounded-full animate-pulse delay-100" />
            <div class="w-2 h-2 bg-amber-400 rounded-full animate-pulse delay-200" />
          </div>

          {/* Back Button */}
          <div class="mt-12">
            <Link
              to="/"
              class="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 text-lg font-amiri"
            >
              <span>العودة للصفحة الرئيسية</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
