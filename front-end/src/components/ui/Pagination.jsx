import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({ meta, onPageChange }) => {
  if (!meta || meta.last_page <= 1) return null;

  return (
    <nav
      className="flex items-center justify-between mt-4 text-sm"
      aria-label="Pagination"
    >
      <p className="text-gray-500 dark:text-gray-400">
        Page {meta.current_page} of {meta.last_page} &middot; {meta.total} total
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onPageChange(meta.current_page - 1)}
          disabled={meta.current_page <= 1}
          aria-label="Previous page"
          className="p-2 rounded-lg border border-gray-300 dark:border-dark-box-outline disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-dark-hover cursor-pointer disabled:cursor-not-allowed"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          type="button"
          onClick={() => onPageChange(meta.current_page + 1)}
          disabled={meta.current_page >= meta.last_page}
          aria-label="Next page"
          className="p-2 rounded-lg border border-gray-300 dark:border-dark-box-outline disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-dark-hover cursor-pointer disabled:cursor-not-allowed"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </nav>
  );
};

export default Pagination;
