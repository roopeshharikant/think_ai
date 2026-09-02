const Comment = require("../models/Comment");
const Discussion = require("../models/Discussion");
const User = require("../models/User");

function buildQueueItem(kind, item) {
    const author = User.findById(item.authorId);
    return {
        id: item.id,
        type: kind,
        title: kind === "discussion" ? item.title : `Comment on discussion ${item.discussionId}`,
        excerpt:
            kind === "discussion"
                ? String(item.body).slice(0, 160)
                : String(item.body).slice(0, 160),
        reason: item.flagReason,
        flaggedAt: item.updatedAt || item.createdAt,
        hidden: Boolean(item.hidden),
        authorName: author ? author.name : "Unknown user",
        authorId: item.authorId
    };
}

function flaggedQueue(_req, res) {
    const discussionItems = Discussion.listAll()
        .filter((d) => d.flagged)
        .map((d) => buildQueueItem("discussion", d));
    const commentItems = Comment.listAll()
        .filter((c) => c.flagged)
        .map((c) => buildQueueItem("comment", c));
    res.status(200).json({ success: true, data: [...discussionItems, ...commentItems] });
}

function listUsers(_req, res) {
    res.status(200).json({ success: true, data: User.list() });
}

function banUser(req, res) {
    const user = User.setBanned(req.params.id, true);
    if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, data: user });
}

function unbanUser(req, res) {
    const user = User.setBanned(req.params.id, false);
    if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, data: user });
}

function setContentVisibility(req, res) {
    const { type, hidden } = req.body || {};
    const id = req.params.id;
    if (!["discussion", "comment"].includes(type)) {
        return res.status(400).json({ success: false, message: "type must be 'discussion' or 'comment'" });
    }
    const updated =
        type === "discussion" ? Discussion.setHidden(id, Boolean(hidden)) : Comment.setHidden(id, Boolean(hidden));
    if (!updated) {
        return res.status(404).json({ success: false, message: `${type} not found` });
    }
    res.status(200).json({
        success: true,
        data: { id, type, hidden: Boolean(updated.hidden) }
    });
}

function resolveContent(req, res) {
    const { type } = req.body || {};
    const id = req.params.id;
    const updated =
        type === "discussion" ? Discussion.setFlagged(id, false) : Comment.setFlagged(id, false);
    if (!updated) {
        return res.status(404).json({ success: false, message: `${type} not found` });
    }
    res.status(200).json({ success: true, data: { id, type, resolved: true } });
}

function hiddenContent(_req, res) {
    const items = [
        ...Discussion.listAll()
            .filter((d) => d.hidden)
            .map((d) => buildQueueItem("discussion", d)),
        ...Comment.listAll()
            .filter((c) => c.hidden)
            .map((c) => buildQueueItem("comment", c))
    ];
    res.status(200).json({ success: true, data: items });
}

module.exports = { flaggedQueue, hiddenContent, listUsers, banUser, unbanUser, setContentVisibility, resolveContent };
