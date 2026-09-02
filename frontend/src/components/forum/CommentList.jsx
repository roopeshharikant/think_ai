import MentionText from "./MentionText";

function formatTimestamp(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Comment thread for a discussion (Phase 1). */
export default function CommentList({ comments }) {
  if (!comments || comments.length === 0) {
    return <p className="loading-note">No comments yet — be the first to reply.</p>;
  }

  return (
    <div className="comment-list">
      {comments.map((comment) => (
        <article key={comment.id} className="comment" data-comment-id={comment.id}>
          <div className="comment__meta">
            <span>
              {comment.author?.name || "Unknown user"} (@{comment.author?.username})
            </span>
            <span>· {formatTimestamp(comment.createdAt)}</span>
          </div>
          <MentionText className="comment__body" text={comment.body} />
        </article>
      ))}
    </div>
  );
}
