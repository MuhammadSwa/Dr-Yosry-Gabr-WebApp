import { createMemo, For, Show } from "solid-js";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  itemsPerPage?: number;
  onPageChange: (page: number) => void;
}

export default function Pagination(props: PaginationProps) {
  // Generate page numbers to display
  const pageNumbers = createMemo(() => {
    const total = props.totalPages;
    const current = props.currentPage;
    const pages: (number | "...")[] = [];

    if (total <= 7) {
      // Show all pages if 7 or less
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      // Always show first page
      pages.push(1);

      if (current > 3) {
        pages.push("...");
      }

      // Show pages around current
      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }

      if (current < total - 2) {
        pages.push("...");
      }

      // Always show last page
      if (!pages.includes(total)) pages.push(total);
    }

    return pages;
  });

  const goToPage = (page: number) => {
    if (page >= 1 && page <= props.totalPages) {
      props.onPageChange(page);
    }
  };

  return (
    <div class="mt-8 flex flex-col items-center gap-4">
      {/* Page Info */}
      <Show when={props.totalItems && props.itemsPerPage}>
        <div class="text-emerald-400 text-sm">
          عرض {((props.currentPage - 1) * props.itemsPerPage!) + 1} - {Math.min(props.currentPage * props.itemsPerPage!, props.totalItems!)} من {props.totalItems} فيديو
        </div>
      </Show>

      {/* Pagination Buttons */}
      <div class="flex flex-wrap items-center justify-center gap-2">
        {/* First Page */}
        <button
          onClick={() => goToPage(1)}
          disabled={props.currentPage === 1}
          class={`p-2 rounded-lg transition-all ${props.currentPage === 1
            ? "text-emerald-600 cursor-not-allowed"
            : "text-emerald-300 hover:bg-emerald-800 hover:text-amber-400"
            }`}
          title="الصفحة الأولى"
        >
          <svg class="w-5 h-5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>

        {/* Previous Page */}
        <button
          onClick={() => goToPage(props.currentPage - 1)}
          disabled={props.currentPage === 1}
          class={`p-2 rounded-lg transition-all ${props.currentPage === 1
            ? "text-emerald-600 cursor-not-allowed"
            : "text-emerald-300 hover:bg-emerald-800 hover:text-amber-400"
            }`}
          title="الصفحة السابقة"
        >
          <svg class="w-5 h-5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Page Numbers */}
        <For each={pageNumbers()}>
          {(page) => (
            <Show
              when={page !== "..."}
              fallback={
                <span class="px-2 text-emerald-500">...</span>
              }
            >
              <button
                onClick={() => goToPage(page as number)}
                class={`min-w-[40px] h-10 rounded-lg font-medium transition-all ${props.currentPage === page
                  ? "bg-amber-500 text-emerald-950"
                  : "text-emerald-300 hover:bg-emerald-800 hover:text-amber-400"
                  }`}
              >
                {page}
              </button>
            </Show>
          )}
        </For>

        {/* Next Page */}
        <button
          onClick={() => goToPage(props.currentPage + 1)}
          disabled={props.currentPage === props.totalPages}
          class={`p-2 rounded-lg transition-all ${props.currentPage === props.totalPages
            ? "text-emerald-600 cursor-not-allowed"
            : "text-emerald-300 hover:bg-emerald-800 hover:text-amber-400"
            }`}
          title="الصفحة التالية"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Last Page */}
        <button
          onClick={() => goToPage(props.totalPages)}
          disabled={props.currentPage === props.totalPages}
          class={`p-2 rounded-lg transition-all ${props.currentPage === props.totalPages
            ? "text-emerald-600 cursor-not-allowed"
            : "text-emerald-300 hover:bg-emerald-800 hover:text-amber-400"
            }`}
          title="الصفحة الأخيرة"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Quick Jump */}
      <div class="flex items-center gap-2 text-sm">
        <span class="text-emerald-400">انتقل إلى:</span>
        <input
          type="number"
          min="1"
          max={props.totalPages}
          value={props.currentPage}
          onChange={(e) => {
            const page = parseInt(e.currentTarget.value);
            if (page >= 1 && page <= props.totalPages) {
              goToPage(page);
            }
          }}
          class="w-16 px-2 py-1 bg-emerald-800 border border-emerald-600 rounded text-center text-emerald-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
        <span class="text-emerald-500">من {props.totalPages}</span>
      </div>
    </div>
  );
}
