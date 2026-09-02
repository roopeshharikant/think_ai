/** Video area placeholder — no real WebRTC in this module (Phase 6). */
export default function VideoPlaceholder({
  title,
  isSharing,
  attendeeCount,
  cameraActive,
  onOpenCamera,
}) {
  return (
    <div
      className={`video-placeholder ${isSharing ? "video-placeholder--sharing" : ""} ${
        cameraActive ? "video-placeholder--active" : ""
      }`}
      data-testid="video-placeholder"
    >
      <span className="video-placeholder__badge">
        {isSharing ? "🖥 Screen share (placeholder)" : cameraActive ? "📷 Camera " : "🎥 Live video"}
      </span>
      <span className="video-placeholder__icon" aria-hidden="true">
        {isSharing ? "🖥️" : cameraActive ? "📷" : "📹"}
      </span>
      <span className="video-placeholder__label">
        {title}
        {typeof attendeeCount === "number" && ` · ${attendeeCount} attendees`}
      </span>
      {onOpenCamera && (
        <button
          type="button"
          className="video-placeholder__action btn btn--primary btn--small"
          onClick={onOpenCamera}
        >
          Start Video
        </button>
      )}
    </div>
  );
}
