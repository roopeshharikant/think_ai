/**
 * Up/down vote buttons with score (Phase 2). The parent applies optimistic
 * updates via `onVote` — this component stays presentational.
 */
export default function VoteButtons({
  score,
  userVote,
  onVote,
  disabled = false,
  orientation = "column",
}) {
  const handleVote = (direction) => {
    if (disabled) return;
    // Clicking the active vote again removes it ("none").
    onVote(direction === userVote ? "none" : direction);
  };

  return (
    <div className={`vote-buttons ${orientation === "column" ? "vote-buttons--column" : ""}`}>
      <button
        type="button"
        className={`vote-button vote-button--up ${userVote === "up" ? "is-active" : ""}`}
        aria-label="Upvote"
        aria-pressed={userVote === "up"}
        disabled={disabled}
        onClick={() => handleVote("up")}
      >
        ▲
      </button>
      <span className="vote-score" aria-label={`Score ${score}`}>
        {score}
      </span>
      <button
        type="button"
        className={`vote-button vote-button--down ${userVote === "down" ? "is-active" : ""}`}
        aria-label="Downvote"
        aria-pressed={userVote === "down"}
        disabled={disabled}
        onClick={() => handleVote("down")}
      >
        ▼
      </button>
    </div>
  );
}
