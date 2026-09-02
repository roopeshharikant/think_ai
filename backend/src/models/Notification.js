const db = require("../data/mockData");

function serialize(notification) {
    return { ...notification };
}

function listByUser(userId, { unreadOnly } = {}) {
    return db.notifications
        .filter((n) => n.userId === userId)
        .filter((n) => (unreadOnly ? !n.read : true))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map(serialize);
}

function create({ userId, type, message, link }) {
    const notification = {
        id: db.makeId("n"),
        userId,
        type: type || "system",
        message,
        link: link || "/forum",
        read: false,
        createdAt: new Date().toISOString()
    };
    db.notifications.unshift(notification);
    return notification;
}

function markRead(id) {
    const notification = db.notifications.find((n) => n.id === id);
    if (!notification) return null;
    notification.read = true;
    return notification;
}

function getPrefs(userId) {
    if (!db.notificationPrefs[userId]) {
        db.notificationPrefs[userId] = { email: true, inApp: true, sms: false };
    }
    return { ...db.notificationPrefs[userId] };
}

function savePrefs(userId, prefs) {
    const current = getPrefs(userId);
    const next = {
        email: typeof prefs.email === "boolean" ? prefs.email : current.email,
        inApp: typeof prefs.inApp === "boolean" ? prefs.inApp : current.inApp,
        sms: typeof prefs.sms === "boolean" ? prefs.sms : current.sms
    };
    db.notificationPrefs[userId] = next;
    return { ...next };
}

module.exports = { serialize, listByUser, create, markRead, getPrefs, savePrefs };
