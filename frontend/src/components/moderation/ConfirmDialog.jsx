import { useEffect } from "react";

/**
 * Self-contained confirmation dialog for the moderation module.
 *
 * Kept local (not imported from components/common) to preserve the Forum
 * module's self-containment guarantee. Renders a centered modal overlay with
 * an optional "danger" confirmation button and Escape-to-cancel support.
 */
export default function ConfirmDialog({
  open,
  title = "Are you sure?",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!open || !onCancel) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="confirm-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      data-testid="confirm-dialog"
      onClick={(event) => {
        if (event.target === event.currentTarget && onCancel) onCancel();
      }}
    >
      <div className="confirm-dialog">
        <h3 className="confirm-dialog__title">{title}</h3>
        {message && <p className="confirm-dialog__message">{message}</p>}
        <div className="confirm-dialog__actions">
          <button
            type="button"
            className="btn btn--small btn--ghost"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`btn btn--small ${danger ? "btn--danger" : "btn--primary"}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
