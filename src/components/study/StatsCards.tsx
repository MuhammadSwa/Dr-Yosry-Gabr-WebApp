interface StatsCardsProps {
  totalVideos: number;
  totalPlaylists: number;
  categoriesCount: number;
}

export default function StatsCards(props: StatsCardsProps) {
  return (
    <div class="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-8">
      <div class="bg-emerald-800/50 rounded-xl p-4 text-center backdrop-blur-sm border border-emerald-700/50">
        <div class="text-2xl font-bold text-amber-400">{props.totalVideos}</div>
        <div class="text-sm text-emerald-300">فيديو</div>
      </div>
      <div class="bg-emerald-800/50 rounded-xl p-4 text-center backdrop-blur-sm border border-emerald-700/50">
        <div class="text-2xl font-bold text-amber-400">{props.totalPlaylists}</div>
        <div class="text-sm text-emerald-300">قائمة تشغيل</div>
      </div>
      <div class="bg-emerald-800/50 rounded-xl p-4 text-center backdrop-blur-sm border border-emerald-700/50">
        <div class="text-2xl font-bold text-amber-400">{props.categoriesCount}</div>
        <div class="text-sm text-emerald-300">تصنيف</div>
      </div>
    </div>
  );
}
