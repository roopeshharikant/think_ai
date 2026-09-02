const User = require("../models/User");

const MENTION_PATTERN = /@([a-zA-Z0-9_]{2,20})/g;

/**
 * Extract all @username mentions from a free-text body.
 * Returns unique usernames in order of appearance.
 */
function extractMentions(text) {
    const mentions = [];
    const source = String(text || "");
    let match = MENTION_PATTERN.exec(source);
    while (match !== null) {
        const username = match[1];
        if (!mentions.includes(username)) mentions.push(username);
        match = MENTION_PATTERN.exec(source);
    }
    MENTION_PATTERN.lastIndex = 0;
    return mentions;
}

/**
 * Resolve mentioned usernames to real users and create an in-app
 * notification for each one (skipping the author themself).
 */
function notifyMentions(text, authorId, { message, link }) {
    const usernames = extractMentions(text);
    const notified = [];

    usernames.forEach((username) => {
        const user = User.findByUsername(username);
        if (!user || user.id === authorId) return;
        notified.push({
            userId: user.id,
            username: user.username,
            type: "mention",
            message,
            link
        });
    });

    return notified;
}

module.exports = { extractMentions, notifyMentions, MENTION_PATTERN };
