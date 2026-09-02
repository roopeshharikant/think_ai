const db = require("../data/mockData");
const Discussion = require("./Discussion");

function listByUser(userId) {
    return db.bookmarks
        .filter((b) => b.userId === userId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map((b) => {
            const discussion = Discussion.findById(b.discussionId);
            return {
                ...b,
                discussion: discussion ? Discussion.serialize(discussion, userId) : null
            };
        })
        .filter((b) => b.discussion !== null);
}

function exists(userId, discussionId) {
    return db.bookmarks.some((b) => b.userId === userId && b.discussionId === discussionId);
}

function add(userId, discussionId) {
    if (exists(userId, discussionId)) {
        return { created: false };
    }
    const bookmark = {
        id: db.makeId("bk"),
        userId,
        discussionId,
        createdAt: new Date().toISOString()
    };
    db.bookmarks.push(bookmark);
    return { created: true, bookmark };
}

function remove(userId, discussionId) {
    const index = db.bookmarks.findIndex(
        (b) => b.userId === userId && b.discussionId === discussionId
    );
    if (index === -1) return false;
    db.bookmarks.splice(index, 1);
    return true;
}

module.exports = { listByUser, exists, add, remove };
