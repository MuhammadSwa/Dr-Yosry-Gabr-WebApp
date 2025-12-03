interface SearchBarProps {
  value: string;
  onInput: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar(props: SearchBarProps) {
  return (
    <div class="max-w-2xl mx-auto">
      <div class="relative">
        <input
          type="text"
          placeholder={props.placeholder ?? "ابحث في الدروس..."}
          value={props.value}
          onInput={(e) => props.onInput(e.currentTarget.value)}
          class="w-full px-6 py-4 pr-14 bg-emerald-800/70 border border-emerald-600 rounded-2xl text-emerald-50 placeholder-emerald-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-lg"
        />
        <div class="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
    </div>
  );
}
