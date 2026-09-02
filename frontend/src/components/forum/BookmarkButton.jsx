/** Bookmark toggle with filled/unfilled state (Phase 5). */
export default function BookmarkButton({ isBookmarked, onToggle, disabled = false }) {
  return (
    <button
      type="button"
      className={`bookmark-button ${isBookmarked ? "is-active" : ""}`}
      aria-pressed={isBookmarked}
      aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
      title={isBookmarked ? "Remove bookmark" : "Add bookmark"}
      disabled={disabled}
      onClick={() => onToggle && onToggle()}
    >
      {isBookmarked ? "🔖" : "📑"}
    </button>
  );
}
