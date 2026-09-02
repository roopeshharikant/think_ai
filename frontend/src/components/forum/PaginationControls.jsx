/**
 * Pagination controls (Phase 1). Server-driven: page + totalPages come from
 * the API response.
 */
export default function PaginationControls({ page, totalPages, onChange }) {
  const pages = [];
  for (let p = 1; p <= Math.max(totalPages, 1); p += 1) pages.push(p);
  const windowed = windowPages(pages, page);

  return (
    <nav className="pagination" aria-label="Pagination">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        aria-label="Previous page"
      >
        ‹ Prev
      </button>

      {windowed.map((entry) =>
        entry === "…" ? (
          <span key={`gap-${entry}`} className="pagination__info">
            …
          </span>
        ) : (
          <button
            key={entry}
            type="button"
            className={entry === page ? "current" : ""}
            onClick={() => onChange(entry)}
            aria-current={entry === page ? "page" : undefined}
          >
            {entry}
          </button>
        )
      )}

      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        aria-label="Next page"
      >
        Next ›
      </button>
    </nav>
  );
}

function windowPages(allPages, current) {
  if (allPages.length <= 7) return allPages;
  const head = allPages.slice(0, 1);
  const tail = allPages.slice(-1);
  let middle = allPages.filter((p) => Math.abs(p - current) <= 1);
  const result = [];
  let previous = null;
  [...head, ...middle, ...tail].forEach((p) => {
    if (previous !== null && p - previous > 1) result.push("…");
    if (!result.includes(p)) result.push(p);
    previous = p;
  });
  return result;
}
