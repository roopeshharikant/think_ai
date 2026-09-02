/**
 * Attendee list with online/offline indicators, mic/camera state and
 * raised hands (Phase 6/7).
 */
export default function AttendeeList({ attendees = [], hostId, currentUserId, onClose }) {
  return (
    <div className="studio-panel studio-drawer">
      <div className="studio-drawer__header">
        <h2>
          Attendees ({attendees.filter((a) => a.online).length}/{attendees.length} online)
        </h2>
        {onClose && (
          <button
            type="button"
            className="studio-close-btn"
            onClick={onClose}
            aria-label="Close attendees"
          >
            ✕
          </button>
        )}
      </div>
      <ul className="attendee-list" data-testid="attendee-list">
        {attendees.map((attendee) => (
          <li key={attendee.userId} className="attendee-row" data-attendee-id={attendee.userId}>
            <span
              className={`attendee-status ${attendee.online ? "attendee-status--online" : ""}`}
              title={attendee.online ? "Online" : "Offline"}
            />
            <span className="attendee-name">
              {attendee.name}
              {attendee.userId === currentUserId ? " (you)" : ""}
            </span>
            {attendee.userId === hostId && <span className="attendee-host">HOST</span>}
            <span className="attendee-icons" aria-hidden="true">
              {attendee.raisedHand && (
                <span className="attendee-hand" role="img" aria-label={`${attendee.name} raised hand`}>
                  ✋
                </span>
              )}
              {!attendee.muted && <span role="img" aria-label="mic on">🎙</span>}
              {attendee.cameraOn && <span role="img" aria-label="camera on">📷</span>}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
