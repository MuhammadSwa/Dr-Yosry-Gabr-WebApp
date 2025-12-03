import StatsCards from "./StatsCards";
import SearchBar from "./SearchBar";

interface StudyHeaderProps {
  title: string;
  description: string;
  stats: {
    totalVideos: number;
    totalPlaylists: number;
    categoriesCount: number;
  };
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export default function StudyHeader(props: StudyHeaderProps) {
  return (
    <header class="bg-gradient-to-b from-emerald-900 to-emerald-950 pt-24 pb-8">
      <div class="container mx-auto px-4">
        {/* Channel Info */}
        <div class="text-center mb-8">
          <h1 class="text-4xl md:text-5xl font-bold text-amber-400 mb-4 font-cairo">
            📚 {props.title}
          </h1>
          <p class="text-emerald-200 text-lg max-w-2xl mx-auto">
            {props.description}
          </p>
        </div>

        {/* Stats Cards */}
        <StatsCards
          totalVideos={props.stats.totalVideos}
          totalPlaylists={props.stats.totalPlaylists}
          categoriesCount={props.stats.categoriesCount}
        />

        {/* Search Bar */}
        <SearchBar
          value={props.searchQuery}
          onInput={props.onSearchChange}
        />
      </div>
    </header>
  );
}
