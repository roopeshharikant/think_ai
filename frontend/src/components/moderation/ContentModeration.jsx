import { useState } from "react";

/**
 * Content moderation panel (Phase 8) — quick hide/show for any discussion
 * or comment by id, used alongside the flagged queue.
 */
export default function ContentModeration({ onHideToggle, busy }) {
  const [type, setType] = useState("discussion");
  const [contentId, setContentId] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!contentId.trim() || !onHideToggle) return;
    onHideToggle(type, contentId.trim());
    setContentId("");
  };

  return (
    <div className="studio-panel">
      <h2>Hide / show content by id</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <select
          className="select"
          value={type}
          aria-label="Content type"
          onChange={(event) => setType(event.target.value)}
        >
          <option value="discussion">Discussion</option>
          <option value="comment">Comment</option>
        </select>
        <input
          type="text"
          className="select"
          style={{ flex: 1, minWidth: 140 }}
          placeholder="e.g. d2 or cm7"
          aria-label="Content id"
          value={contentId}
          onChange={(event) => setContentId(event.target.value)}
        />
        <button type="submit" className="btn btn--small" disabled={busy}>
          Toggle visibility
        </button>
      </form>
      <p className="loading-note" style={{ padding: "10px 0 0", textAlign: "left", fontSize: "0.75rem" }}>
        Toggles between hidden and visible; result arrives as a moderation toast.
      </p>
    </div>
  );
}
