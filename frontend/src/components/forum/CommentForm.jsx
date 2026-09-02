import { useState } from "react";
import { validateCommentBody } from "../../utils/validation";

/** New comment form with client-side validation (Phase 1). */
export default function CommentForm({ onSubmit, disabled = false }) {
  const [body, setBody] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const { valid, error: validationError, trimmed } = validateCommentBody(body);
    if (!valid) {
      setError(validationError);
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(trimmed);
      setBody("");
    } catch (err) {
      setError(err.message || "Could not post comment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="comment-form" onSubmit={handleSubmit} noValidate>
      <div className="field">
        <label htmlFor="comment-body">Add a comment — use @username to mention someone</label>
        <textarea
          id="comment-body"
          value={body}
          placeholder="Share your thoughts…"
          onChange={(event) => setBody(event.target.value)}
          disabled={disabled || submitting}
        />
        {error && (
          <p className="field-error" role="alert">
            {error}
          </p>
        )}
      </div>
      <button type="submit" className="btn btn--primary" disabled={disabled || submitting}>
        {submitting ? "Posting…" : "Post comment"}
      </button>
    </form>
  );
}
