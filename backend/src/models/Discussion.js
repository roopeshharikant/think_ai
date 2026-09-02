const db = require("../data/mockData");

function serialize(discussion, currentUserId) {
    const author = db.users.find((u) => u.id === discussion.authorId);
    const userVote = currentUserId
        ? db.votesFor(discussion.id).get(currentUserId) || "none"
        : "none";
    return {
        ...discussion,
        flagReason: undefined,
        author: {
            id: discussion.authorId,
            name: author ? author.name : "Unknown user",
            username: author ? author.username : "unknown"
        },
        score: discussion.upvotes - discussion.downvotes,
        replyCount: db.comments.filter((c) => c.discussionId === discussion.id && !c.hidden).length,
        userVote
    };
}

function findById(id) {
    return db.discussions.find((d) => d.id === id) || null;
}

function listAll() {
    return db.discussions;
}

function create({ title, body, tags, categoryId, authorId }) {
    const now = new Date().toISOString();
    const discussion = {
        id: db.makeId("d"),
        title,
        body,
        tags: Array.isArray(tags) ? tags.slice(0, 6).map((t) => String(t).trim().toLowerCase()).filter(Boolean) : [],
        categoryId: categoryId || "c-general",
        authorId,
        createdAt: now,
        updatedAt: now,
        solved: false,
        hidden: false,
        flagged: false,
        flagReason: null,
        views: 0,
        upvotes: 0,
        downvotes: 0
    };
    db.discussions.unshift(discussion);
    return discussion;
}

function vote(discussionId, userId, direction) {
    const discussion = findById(discussionId);
    if (!discussion) return null;
    const userVotes = db.votesFor(discussionId);
    const previous = userVotes.get(userId) || "none";

    if (direction === previous || direction === "none") {
        userVotes.delete(userId);
    } else {
        userVotes.set(userId, direction);
    }

    let upvotes = 0;
    let downvotes = 0;
    userVotes.forEach((value) => {
        if (value === "up") upvotes += 1;
        else downvotes += 1;
    });
    discussion.upvotes = upvotes;
    discussion.downvotes = downvotes;

    return { discussion, userVote: userVotes.get(userId) || "none" };
}

function setSolved(id, solved) {
    const discussion = findById(id);
    if (!discussion) return null;
    discussion.solved = Boolean(solved);
    discussion.updatedAt = new Date().toISOString();
    return discussion;
}

function setHidden(id, hidden) {
    const discussion = findById(id);
    if (!discussion) return null;
    discussion.hidden = Boolean(hidden);
    return discussion;
}

function setFlagged(id, flagged, reason) {
    const discussion = findById(id);
    if (!discussion) return null;
    discussion.flagged = Boolean(flagged);
    discussion.flagReason = flagged ? reason || "Reported by user" : null;
    return discussion;
}

function incrementViews(id) {
    const discussion = findById(id);
    if (discussion) discussion.views += 1;
    return discussion;
}

module.exports = { serialize, findById, listAll, create, vote, setSolved, setHidden, setFlagged, incrementViews };
