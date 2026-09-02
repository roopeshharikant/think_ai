import { parseMentionSegments } from "../../utils/mentionParser";

/**
 * Renders discussion/comment bodies with @mentions highlighted (Phase 5).
 * Text segments are rendered as raw text nodes so wrapper textContent stays
 * intact for styling and tests.
 */
export default function MentionText({ text, className }) {
  const segments = parseMentionSegments(text);

  return (
    <span className={className}>
      {segments.map((segment, index) =>
        segment.type === "mention" ? (
          <mark
            key={`${segment.value}-${index}`}
            className="mention"
            data-mention={segment.value.toLowerCase()}
          >
            @{segment.value}
          </mark>
        ) : (
          segment.value
        )
      )}
    </span>
  );
}
