import { useCallback, useEffect, useMemo, useState } from "react";

const DEFAULT_AUTO_DISMISS_MS = 5000;

/**
 * Stacked toast notifications (Phase 8).
 *
 * Accepts both `toasts` and `notifications` props (they are aliases) plus
 * `autoDismissMs`/`autoCloseMs` for the auto-dismiss delay. Pass `null` to
 * disable auto-dismissing entirely. Each notification:
 *   { id, message, link?, type? }
 */
export default function NotificationToast({
  toasts,
  notifications,
  onDismiss,
  autoDismissMs,
  autoCloseMs,
  onAction,
}) {
  const items = useMemo(() => toasts || notifications || [], [toasts, notifications]);
  const delay =
    autoDismissMs !== undefined ? autoDismissMs : autoCloseMs !== undefined ? autoCloseMs : DEFAULT_AUTO_DISMISS_MS;

  useEffect(() => {
    if (!delay || !onDismiss) return undefined;
    const timers = items.map((notification) =>
      setTimeout(() => onDismiss(notification.id), delay)
    );
    return () => timers.forEach(clearTimeout);
  }, [items, delay, onDismiss]);

  if (!items || items.length === 0) return null;

  return (
    <div className="notification-toast-stack" role="status" aria-live="polite">
      {items.map((notification) => (
        <div
          key={notification.id}
          className={`notification-toast${notification.type === "moderation" ? " notification-toast--moderation" : ""}`}
          data-testid="toast"
          data-notification-id={notification.id}
        >
          <span aria-hidden="true">{notification.type === "moderation" ? "🛡" : "🔔"}</span>
          <span className="notification-toast__message">{notification.message}</span>
          <button
            type="button"
            className="notification-toast__action"
            aria-label="Open related live panel"
            onClick={() => onAction && onAction(notification)}
          >
            Open
          </button>
          <button
            type="button"
            className="notification-toast__close"
            aria-label="Dismiss notification"
            onClick={() => onDismiss && onDismiss(notification.id)}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

/**
 * Tiny local toast-list manager shared by pages that only need imperative
 * `pushToast`/`dismissToast` helpers (Phase 5 mentions, Phase 8 actions).
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useToastList() {
  const [toasts, setToasts] = useState([]);

  const pushToast = useCallback((message, type = "info") => {
    const id = `toast-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`;
    setToasts((previous) => [...previous.slice(-2), { id, message, type }]);
    return id;
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((previous) => previous.filter((toast) => toast.id !== id));
  }, []);

  return { toasts, pushToast, dismissToast };
}
