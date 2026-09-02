/**
 * Reusable wrapper for live studio contextual side panels (chat, attendees,
 * polls, breakout rooms). Keeps a consistent header with a close button and a
 * compact drawer layout. Each specialized panel is rendered inside this.
 */
export default function LiveSidePanel({ title, badge, onClose, children }) {
  return (
    <div className="studio-panel studio-drawer">
      <div className="studio-drawer__header">
        <h2>
          {title}
          {typeof badge === "number" && badge > 0 && (
            <span className="studio-drawer__badge">{badge}</span>
          )}
        </h2>
        {onClose && (
          <button
            type="button"
            className="studio-close-btn"
            onClick={onClose}
            aria-label={`Close ${title}`}
          >
            ✕
          </button>
        )}
      </div>
      {children}
    </div>
  );
}
