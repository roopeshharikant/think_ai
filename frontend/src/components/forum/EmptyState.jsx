/** Friendly empty state used across forum lists (Phase 4). */
export default function EmptyState({
  icon = "💬",
  title = "Nothing here yet",
  message = "No discussions are available right now.",
  actionLabel,
  onAction,
}) {
  return (
    <div className="empty-state" role="status">
      <div className="empty-state__icon" aria-hidden="true">
        {icon}
      </div>
      <h2>{title}</h2>
      <p>{message}</p>
      {actionLabel && onAction && (
        <button type="button" className="btn btn--primary" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
