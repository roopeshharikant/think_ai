/**
 * @mention parsing for discussion and comment bodies (Phase 5).
 *
 * A mention is `@username` — letters, digits and underscores, at least two
 * characters long. Mentions inside words (`foo@bar`) are ignored.
 */

const MENTION_PATTERN = /(^|[\s(])@([a-zA-Z0-9_]{2,30})\b/g;

/** Returns the unique lowercase usernames mentioned in `text`. */
export function extractMentions(text) {
  const mentions = [];
  const source = String(text || "");
  let match = MENTION_PATTERN.exec(source);
  while (match !== null) {
    const username = match[2].toLowerCase();
    if (!mentions.includes(username)) mentions.push(username);
    match = MENTION_PATTERN.exec(source);
  }
  MENTION_PATTERN.lastIndex = 0;
  return mentions;
}

/**
 * Splits text into segments for rendering:
 * [{ type: "text", value }, { type: "mention", value: "priya" }, ...]
 */
export function parseMentionSegments(text) {
  const segments = [];
  let lastIndex = 0;
  const source = String(text || "");

  let match = MENTION_PATTERN.exec(source);
  while (match !== null) {
    const mentionStart = match.index + match[1].length;
    if (mentionStart > lastIndex) {
      segments.push({ type: "text", value: source.slice(lastIndex, mentionStart) });
    }
    segments.push({ type: "mention", value: match[2] });
    lastIndex = mentionStart + match[0].length - match[1].length;
    match = MENTION_PATTERN.exec(source);
  }
  MENTION_PATTERN.lastIndex = 0;

  if (lastIndex < source.length) {
    segments.push({ type: "text", value: source.slice(lastIndex) });
  }
  return segments;
}
