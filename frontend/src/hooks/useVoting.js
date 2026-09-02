import { useCallback, useRef, useState } from "react";
import { voteDiscussion } from "../services/forumApi";

/**
 * Optimistic voting (Phase 2).
 *
 * The UI updates immediately; if POST /discussions/:id/vote fails the
 * previous state is restored (snapshot kept per discussion id).
 */
export function useVoting(onVoteError) {
  const [pendingIds, setPendingIds] = useState(() => new Set());
  const snapshotsRef = useRef(new Map());

  const setPending = useCallback((id, isPending) => {
    setPendingIds((previous) => {
      const next = new Set(previous);
      if (isPending) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const vote = useCallback(
    async (discussion, direction, applyLocalUpdate) => {
      const id = typeof discussion === "string" ? discussion : discussion.id;
      snapshotsRef.current.set(id, discussion);
      setPending(id, true);

      // Optimistic update first — the UI must react instantly.
      applyLocalUpdate({
        id,
        userVote: direction === "none" ? "none" : direction,
        upvotes:
          direction === "up"
            ? (Number(discussion.upvotes) || 0) + (discussion.userVote === "up" ? -1 : 1)
            : Math.max((Number(discussion.upvotes) || 0) - (discussion.userVote === "up" ? 1 : 0), 0),
        downvotes:
          direction === "down"
            ? (Number(discussion.downvotes) || 0) + (discussion.userVote === "down" ? -1 : 1)
            : Math.max((Number(discussion.downvotes) || 0) - (discussion.userVote === "down" ? 1 : 0), 0),
      });

      try {
        const result = await voteDiscussion(id, direction);
        // Reconcile with the server truth.
        applyLocalUpdate(result);
      } catch (err) {
        const snapshot = snapshotsRef.current.get(id);
        if (snapshot) {
          applyLocalUpdate(snapshot); // Roll back on failure.
        }
        if (onVoteError) onVoteError(err.message || "Vote failed — reverted");
      } finally {
        snapshotsRef.current.delete(id);
        setPending(id, false);
      }
    },
    [onVoteError, setPending]
  );

  return { vote, pendingIds };
}
