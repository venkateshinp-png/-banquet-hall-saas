interface Props {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function getPageNumbers(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages: (number | 'ellipsis')[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  if (start > 2) pages.push('ellipsis');
  for (let i = start; i <= end; i++) {
    if (!pages.includes(i)) pages.push(i);
  }
  if (end < total - 1) pages.push('ellipsis');
  if (total > 1) pages.push(total);

  return pages;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: Props) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <nav
      className="flex items-center justify-center gap-1"
      aria-label="Pagination"
    >
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-[#1e3a8a] disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Previous page"
      >
        Previous
      </button>

      <div className="flex items-center gap-1">
        {pages.map((page, i) =>
          page === 'ellipsis' ? (
            <span
              key={`ellipsis-${i}`}
              className="px-2 py-1 text-sm text-slate-400"
            >
              ...
            </span>
          ) : (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              className={`
                min-w-[2.25rem] rounded-lg border px-3 py-2 text-sm font-medium transition-colors
                ${currentPage === page
                  ? 'border-[#1e3a8a] bg-[#1e3a8a] text-white'
                  : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50 hover:text-[#1e3a8a]'}
              `}
            >
              {page}
            </button>
          )
        )}
      </div>

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-[#1e3a8a] disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Next page"
      >
        Next
      </button>
    </nav>
  );
}
