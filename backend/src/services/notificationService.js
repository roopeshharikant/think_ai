const Notification = require("../models/Notification");

/**
 * Create notifications for every @mention found in `text`.
 * Respects each recipient's in-app preference; returns the created list so
 * callers (REST or websocket) can push toasts to connected clients.
 */
function notifyMentions({ text, authorId, message, link }) {
    const pending = require("./mentionService").notifyMentions(text, authorId, { message, link });
    return pending
        .filter((item) => {
            const prefs = Notification.getPrefs(item.userId);
            return prefs.inApp !== false;
        })
        .map((item) =>
            Notification.create({
                userId: item.userId,
                type: item.type,
                message: item.message,
                link: item.link
            })
        );
}

function listForUser(userId) {
    return Notification.listByUser(userId);
}

module.exports = { notifyMentions, listForUser };
