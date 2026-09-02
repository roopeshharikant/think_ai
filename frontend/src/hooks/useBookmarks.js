import { useCallback, useEffect, useState } from "react";
import { addBookmark, fetchBookmarks, removeBookmark } from "../services/bookmarkApi";
import { getCurrentUserId } from "../services/forumHttpClient";

/**
 * Bookmark state with optimistic toggle + mock API persistence (Phase 5/9).
 * `bookmarkedIds` is kept in sync so every BookmarkButton reflects reality.
 */
export function useBookmarks(onError) {
  const [bookmarkedIds, setBookmarkedIds] = useState(() => new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchBookmarks()
      .then((bookmarks) => {
        if (cancelled) return;
        setBookmarkedIds(new Set(bookmarks.map((b) => b.discussionId)));
      })
      .catch((err) => {
        if (!cancelled && onError) onError(err.message || "Failed to load bookmarks");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isBookmarked = useCallback((id) => bookmarkedIds.has(id), [bookmarkedIds]);

  const toggleBookmark = useCallback(
    async (discussionId) => {
      const wasBookmarked = bookmarkedIds.has(discussionId);

      // Optimistic flip.
      setBookmarkedIds((previous) => {
        const next = new Set(previous);
        if (wasBookmarked) next.delete(discussionId);
        else next.add(discussionId);
        return next;
      });

      try {
        if (wasBookmarked) await removeBookmark(getCurrentUserId(), discussionId);
        else await addBookmark(discussionId);
      } catch (err) {
        // Revert on failure.
        setBookmarkedIds((previous) => {
          const next = new Set(previous);
          if (wasBookmarked) next.add(discussionId);
          else next.delete(discussionId);
          return next;
        });
        if (onError) onError(err.message || "Bookmark failed — reverted");
      }
    },
    [bookmarkedIds, onError]
  );

  return { bookmarkedIds, isBookmarked, toggleBookmark, loading };
}
