/**
 * Tag filter chips (Phase 2). Renders the provided tags; an active tag can
 * be clicked again to clear the filter.
 */
export default function TagFilter({ tags, activeTag, onSelect }) {
  if (!tags || tags.length === 0) return null;

  return (
    <div className="tag-filter" aria-label="Filter by tag">
      {tags.map((tag) => {
        const isActive = activeTag === tag;
        return (
          <button
            key={tag}
            type="button"
            className={`tag-chip ${isActive ? "tag-chip--active" : ""}`}
            aria-pressed={isActive}
            onClick={() => onSelect(isActive ? null : tag)}
          >
            {isActive && <span className="tag-chip__clear" aria-hidden="true">✕</span>}
            #{tag}
          </button>
        );
      })}
    </div>
  );
}
