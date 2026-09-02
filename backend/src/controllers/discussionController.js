const Comment = require("../models/Comment");
const Discussion = require("../models/Discussion");
const notificationService = require("../services/notificationService");
const discussionService = require("../services/discussionService");

function list(req, res) {
    const result = discussionService.listDiscussions(req.query, req.user ? req.user.id : null);
    res.status(200).json({ success: true, data: result });
}

function getOne(req, res) {
    const discussion = Discussion.findById(req.params.id);
    if (!discussion || discussion.hidden) {
        return res.status(404).json({ success: false, message: "Discussion not found" });
    }
    Discussion.incrementViews(discussion.id);
    res.status(200).json({ success: true, data: Discussion.serialize(discussion, req.user.id) });
}

function create(req, res) {
    const { valid, errors, trimmedTitle, trimmedBody } =
        discussionService.validateDiscussionInput(req.body);

    if (!valid) {
        return res.status(400).json({ success: false, message: "Validation failed", errors });
    }

    const discussion = Discussion.create({
        title: trimmedTitle,
        body: trimmedBody,
        tags: req.body.tags,
        categoryId: req.body.categoryId,
        authorId: req.user.id
    });

    const createdNotifications = notificationService.notifyMentions({
        text: trimmedBody,
        authorId: req.user.id,
        message: `${req.user.username} mentioned you in “${trimmedTitle}”`,
        link: `/forum/${discussion.id}`
    });

    res.status(201).json({
        success: true,
        data: Discussion.serialize(discussion, req.user.id),
        notificationsCreated: createdNotifications.length
    });
}

function vote(req, res) {
    const direction = req.body.direction;
    if (!["up", "down", "none"].includes(direction)) {
        return res.status(400).json({
            success: false,
            message: "direction must be one of: up, down, none"
        });
    }

    const result = Discussion.vote(req.params.id, req.user.id, direction);
    if (!result) {
        return res.status(404).json({ success: false, message: "Discussion not found" });
    }

    res.status(200).json({
        success: true,
        data: {
            id: result.discussion.id,
            upvotes: result.discussion.upvotes,
            downvotes: result.discussion.downvotes,
            score: result.discussion.upvotes - result.discussion.downvotes,
            userVote: result.userVote
        }
    });
}

function setSolved(req, res) {
    const discussion = Discussion.setSolved(req.params.id, Boolean(req.body.solved));
    if (!discussion) {
        return res.status(404).json({ success: false, message: "Discussion not found" });
    }
    res.status(200).json({ success: true, data: Discussion.serialize(discussion, req.user.id) });
}

function flag(req, res) {
    const discussion = Discussion.setFlagged(req.params.id, true, req.body.reason);
    if (!discussion) {
        return res.status(404).json({ success: false, message: "Discussion not found" });
    }
    res.status(201).json({ success: true, data: { id: discussion.id, flagged: true } });
}

module.exports = { list, getOne, create, vote, setSolved, flag };
