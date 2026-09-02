/** Pagination helpers shared by the discussion list UI. */

export const DEFAULT_PAGE_SIZE = 10;

/** Builds the query object understood by GET /api/discussions. */
export function buildDiscussionQuery({ page, limit, filters }) {
  return {
    page: Math.max(Number(page) || 1, 1),
    limit: Math.min(Math.max(Number(limit) || DEFAULT_PAGE_SIZE, 1), 50),
    ...filters,
  };
}

/**
 * Window of page numbers around the current page for pager buttons,
 * e.g. getPageWindow(4, 9, 1) → [1, 2, 3, 4, 5].
 */
export function getPageWindow(currentPage, totalPages, windowSize = 5) {
  const total = Math.max(Number(totalPages) || 1, 1);
  const half = Math.floor(windowSize / 2);
  let start = Math.max((Number(currentPage) || 1) - half, 1);
  const end = Math.min(start + windowSize - 1, total);
  start = Math.max(end - windowSize + 1, 1);

  const pages = [];
  for (let page = start; page <= end; page += 1) pages.push(page);
  return pages;
}

export function hasPreviousPage(page) {
  return (Number(page) || 1) > 1;
}

export function hasNextPage(page, totalPages) {
  return (Number(page) || 1) < (Number(totalPages) || 1);
}
