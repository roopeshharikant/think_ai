import { Link } from "react-router-dom";
import MentionText from "./MentionText";
import VoteButtons from "./VoteButtons";
import BookmarkButton from "./BookmarkButton";

function formatTimestamp(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Full thread view: body, votes, solved toggle, flag + bookmark actions and
 * the comment thread passed as children (Phase 1/2).
 */
export default function DiscussionDetails({
  discussion,
  onVote,
  votePending = false,
  isBookmarked,
  onToggleBookmark,
  canManageSolved = false,
  onToggleSolved,
  onFlag,
  commentsSection,
}) {
  if (!discussion) return null;

  return (
    <article className="thread-card" data-discussion-id={discussion.id}>
      <div className="thread-card__header">
        <Link to="/forum" className="back-link">
          ← Back to discussions
        </Link>
        {discussion.solved && (
          <span className="badge badge--solved" title="Marked as solved">
            ✓ Solved
          </span>
        )}
      </div>

      <h1>{discussion.title}</h1>

      <div className="card-footer" style={{ marginBottom: 14 }}>
        <span>{discussion.author?.name}</span>
        <span>@{discussion.author?.username}</span>
        <span>· {formatTimestamp(discussion.createdAt)}</span>
        <span>· 👁 {discussion.views} views</span>
      </div>

      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        <VoteButtons
          score={discussion.score}
          userVote={discussion.userVote}
          onVote={onVote}
          disabled={votePending}
        />
        <MentionText className="thread-card__body" text={discussion.body} />
      </div>

      {(discussion.tags || []).length > 0 && (
        <div className="tag-filter" style={{ marginTop: 16 }}>
          {discussion.tags.map((tag) => (
            <Link key={tag} to={`/forum?tag=${encodeURIComponent(tag)}`} className="tag-chip">
              #{tag}
            </Link>
          ))}
        </div>
      )}

      <div
        className="card-footer"
        style={{ marginTop: 18, paddingTop: 12, borderTop: "1px solid var(--forum-border)" }}
      >
        <BookmarkButton isBookmarked={isBookmarked} onToggle={onToggleBookmark} />
        <span>Bookmarked</span>
        {canManageSolved && (
          <button type="button" className="btn btn--small solved-toggle" onClick={onToggleSolved}>
            {discussion.solved ? "Unmark solved" : "Mark as solved"}
          </button>
        )}
        <span style={{ flex: 1 }} />
        <button type="button" className="btn btn--small btn--ghost btn--danger" onClick={onFlag}>
          🚩 Flag
        </button>
      </div>

      {commentsSection}
    </article>
  );
}
