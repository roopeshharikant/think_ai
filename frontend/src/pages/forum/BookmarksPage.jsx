import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../../styles/forum.css";

import DiscussionList from "../../components/forum/DiscussionList";
import EmptyState from "../../components/forum/EmptyState";
import { fetchBookmarks, removeBookmark } from "../../services/bookmarkApi";

/** Bookmarked discussions page (Phase 5/9) with mock API sync. */
export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchBookmarks()
      .then((data) => {
        if (!cancelled) setBookmarks(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Failed to load bookmarks");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleRemove = async (discussionId) => {
    // Optimistic removal, restore on failure.
    const snapshot = bookmarks;
    setBookmarks((previous) => previous.filter((b) => b.discussionId !== discussionId));
    try {
      await removeBookmark(bookmarks.find((b) => b.discussionId === discussionId)?.userId, discussionId);
    } catch {
      setBookmarks(snapshot);
      setError("Could not remove bookmark — restored");
    }
  };

  return (
    <div className="forum-page">
      <div className="forum-container">
        <header className="forum-header">
          <h1>🔖 Bookmarks</h1>
          <Link to="/forum" className="btn btn--ghost">← Forum</Link>
        </header>

        {error && (
          <div className="error-banner" role="alert">
            {error}
          </div>
        )}

        {loading ? (
          <p className="loading-note">Loading bookmarks…</p>
        ) : bookmarks.length === 0 ? (
          <EmptyState
            icon="🔖"
            title="No bookmarks yet"
            message="Bookmark discussions to find them quickly later."
            actionLabel="Browse discussions"
            onAction={() => window.history.back()}
          />
        ) : (
          <DiscussionList
            discussions={bookmarks.map((bookmark) => ({
              ...bookmark.discussion,
              userVote: bookmark.discussion.userVote,
            }))}
            isBookmarked={() => true}
            onToggleBookmark={handleRemove}
            emptyTitle="No bookmarks yet"
            emptyMessage="Bookmark discussions to find them quickly later."
          />
        )}
      </div>
    </div>
  );
}
