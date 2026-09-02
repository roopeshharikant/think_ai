/**
 * Bottom studio toolbar: mic, camera, screen-share placeholder, raise-hand and
 * contextual panel toggles (chat, attendees, polls, breakout rooms). Buttons
 * are controlled by the page state.
 */
export default function StudioToolbar({
  muted,
  cameraOn,
  sharing,
  handRaised,
  activePanel,
  onToggleMute,
  onToggleCamera,
  onToggleShare,
  onToggleHand,
  onOpenChat,
  onOpenAttendees,
  onOpenPolls,
  onOpenBreakout,
}) {
  return (
    <div className="studio-toolbar" role="toolbar" aria-label="Studio controls">
      <button
        type="button"
        className={`toolbar-button ${muted ? "is-off" : "is-on"}`}
        aria-pressed={muted}
        onClick={onToggleMute}
      >
        <span className="toolbar-icon" aria-hidden="true">{muted ? "🔇" : "🎙️"}</span>
        {muted ? "Unmute" : "Mute"}
      </button>

      <button
        type="button"
        className={`toolbar-button ${cameraOn || activePanel === "camera" ? "is-on" : "is-off"}`}
        aria-pressed={cameraOn || activePanel === "camera"}
        onClick={onToggleCamera}
      >
        <span className="toolbar-icon" aria-hidden="true">
          {cameraOn || activePanel === "camera" ? "📷" : "🚫"}
        </span>
        Camera
      </button>

      <button
        type="button"
        className={`toolbar-button ${sharing ? "is-on" : ""}`}
        aria-pressed={sharing}
        onClick={onToggleShare}
      >
        <span className="toolbar-icon" aria-hidden="true">🖥️</span>
        Share
      </button>

      <button
        type="button"
        className={`toolbar-button ${handRaised ? "is-active-hand" : ""}`}
        aria-pressed={handRaised}
        onClick={onToggleHand}
      >
        <span className="toolbar-icon" aria-hidden="true">✋</span>
        Hand
      </button>

      <span className="toolbar-divider" aria-hidden="true" />

      <button
        type="button"
        className={`toolbar-button ${activePanel === "chat" ? "is-active-tool" : ""}`}
        aria-pressed={activePanel === "chat"}
        onClick={onOpenChat}
      >
        <span className="toolbar-icon" aria-hidden="true">💬</span>
        Chat
      </button>

      <button
        type="button"
        className={`toolbar-button ${activePanel === "attendees" ? "is-active-tool" : ""}`}
        aria-pressed={activePanel === "attendees"}
        onClick={onOpenAttendees}
      >
        <span className="toolbar-icon" aria-hidden="true">👥</span>
        Attendees
      </button>

      <button
        type="button"
        className={`toolbar-button ${activePanel === "polls" ? "is-active-tool" : ""}`}
        aria-pressed={activePanel === "polls"}
        onClick={onOpenPolls}
      >
        <span className="toolbar-icon" aria-hidden="true">📊</span>
        Polls
      </button>

      <button
        type="button"
        className={`toolbar-button ${activePanel === "breakout" ? "is-active-tool" : ""}`}
        aria-pressed={activePanel === "breakout"}
        onClick={onOpenBreakout}
      >
        <span className="toolbar-icon" aria-hidden="true">🪟</span>
        Rooms
      </button>
    </div>
  );
}
