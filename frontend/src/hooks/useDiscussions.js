import { useCallback, useEffect, useRef, useState } from "react";
import { fetchDiscussions } from "../services/forumApi";
import { buildDiscussionQuery } from "../utils/pagination";

/**
 * Loads a paginated, filtered discussion list from the API (Phase 1/9).
 * All filtering happens server-side so the list scales to 1000+ posts.
 * A monotonically increasing request id guards against out-of-order
 * responses when filters or pages change quickly.
 */
export function useDiscussions(initialFilters = {}, initialLimit = 10) {
  const [filters, setFilters] = useState(initialFilters);
  const [page, setPage] = useState(1);
  const [limit] = useState(initialLimit);
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: initialLimit, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);
  const requestIdRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    const requestId = ++requestIdRef.current;

    fetchDiscussions(buildDiscussionQuery({ page, limit, filters }))
      .then((result) => {
        if (cancelled || requestId !== requestIdRef.current) return;
        setItems(result.items || []);
        setMeta({
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        });
        setError(null);
      })
      .catch((err) => {
        if (cancelled || requestId !== requestIdRef.current) return;
        setError(err.message || "Failed to load discussions");
        setItems([]);
      })
      .finally(() => {
        if (!cancelled && requestId === requestIdRef.current) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, limit, filters, reloadToken]);

  /** Applies new filters and resets to the first page. */
  const applyFilters = useCallback((nextFilters) => {
    setFilters(nextFilters);
    setPage(1);
  }, []);

  /** Re-runs the current query (used by manual refresh buttons). */
  const refresh = useCallback(() => setReloadToken((token) => token + 1), []);

  return { items, setItems, meta, page, setPage, loading, error, filters, applyFilters, refresh };
}
