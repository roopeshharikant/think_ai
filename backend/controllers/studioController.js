const StudioSession = require("../models/live-studio/StudiosSession");
const Poll = require("../models/live-studio/Poll");
const ChatMessage = require("../models/live-studio/ChatMessage");

function serializePoll(poll) {
    const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0);
    return {
        id: poll._id,
        sessionId: poll.sessionId,
        question: poll.question,
        status: poll.status,
        totalVotes,
        options: poll.options.map((option) => ({
            id: option._id,
            text: option.text,
            votes: option.votes,
            percent: totalVotes === 0 ? 0 : Math.round((option.votes / totalVotes) * 100)
        }))
    };
}

async function getSession(req, res) {
    try {
        const sessionId = req.params.id;
        let session = await StudioSession.findOne({ sessionId });
        
        if (!session) {
            // Auto-initialize session if it doesn't exist in DB yet
            session = await StudioSession.create({
                sessionId,
                title: `Live Class Session (${sessionId})`,
                hostId: req.user.id,
                status: "active"
            });
        }

        const polls = await Poll.find({ sessionId, status: "open" });
        const messages = await ChatMessage.find({ sessionId, deleted: false }).sort({ createdAt: 1 }).limit(100);

        res.status(200).json({
            success: true,
            data: {
                id: session.sessionId,
                title: session.title,
                hostId: session.hostId,
                status: session.status,
                startedAt: session.startedAt,
                attendees: session.attendees,
                polls: polls.map(serializePoll),
                messages: messages.map(m => ({ messageId: m._id, userId: m.userId, text: m.text, sentAt: m.createdAt }))
            }
        });
    } catch (err) {
        console.error("Error fetching session:", err);
        res.status(500).json({ success: false, message: "Server error fetching session" });
    }
}

async function joinSession(req, res) {
    try {
        const sessionId = req.params.id;
        let session = await StudioSession.findOne({ sessionId });

        if (!session) {
            session = await StudioSession.create({
                sessionId,
                title: `Live Class Session (${sessionId})`,
                hostId: req.user.id,
                status: "active"
            });
        }

        const attendeeIndex = session.attendees.findIndex((a) => a.userId === req.user.id);
        if (attendeeIndex === -1) {
            session.attendees.push({
                userId: req.user.id,
                name: req.user.name || "Participant",
                online: true,
                muted: true,
                cameraOn: false,
                raisedHand: false
            });
        } else {
            session.attendees[attendeeIndex].online = true;
        }

        await session.save();

        const polls = await Poll.find({ sessionId, status: "open" });
        const messages = await ChatMessage.find({ sessionId, deleted: false }).sort({ createdAt: 1 }).limit(100);

        res.status(200).json({
            success: true,
            data: {
                id: session.sessionId,
                title: session.title,
                hostId: session.hostId,
                status: session.status,
                startedAt: session.startedAt,
                attendees: session.attendees,
                polls: polls.map(serializePoll),
                messages: messages.map(m => ({ messageId: m._id, userId: m.userId, text: m.text, sentAt: m.createdAt }))
            }
        });
    } catch (err) {
        console.error("Error joining session:", err);
        res.status(500).json({ success: false, message: "Server error joining session" });
    }
}

async function createPoll(req, res) {
    try {
        const sessionId = req.params.id;
        const question = String(req.body.question || "").trim();
        const rawOptions = Array.isArray(req.body.options) ? req.body.options : [];
        const optionsText = rawOptions.map((text) => String(text).trim()).filter(Boolean).slice(0, 6);

        if (question.length < 5 || optionsText.length < 2) {
            return res.status(400).json({
                success: false,
                message: "Validation failed: Question must be >= 5 chars and require at least 2 options."
            });
        }

        const poll = await Poll.create({
            sessionId,
            question,
            options: optionsText.map(text => ({ text, votes: 0 })),
            status: "open"
        });

        res.status(201).json({ success: true, data: serializePoll(poll) });
    } catch (err) {
        console.error("Error creating poll:", err);
        res.status(500).json({ success: false, message: "Server error creating poll" });
    }
}

async function votePoll(req, res) {
    try {
        const pollId = req.params.pollId;
        const { optionId } = req.body;

        const poll = await Poll.findById(pollId);
        if (!poll || poll.status !== "open") {
            return res.status(404).json({ success: false, message: "Active poll not found" });
        }

        const option = poll.options.id(optionId);
        if (!option) {
            return res.status(404).json({ success: false, message: "Poll option not found" });
        }

        if (!poll.voters) poll.voters = new Map();
        const previousOptionId = poll.voters.get(req.user.id);

        if (previousOptionId && previousOptionId.toString() !== optionId.toString()) {
            const previousOption = poll.options.id(previousOptionId);
            if (previousOption && previousOption.votes > 0) {
                previousOption.votes -= 1;
            }
        }

        if (previousOptionId !== optionId.toString()) {
            option.votes += 1;
            poll.voters.set(req.user.id, optionId);
            await poll.save();
        }

        res.status(200).json({ success: true, data: serializePoll(poll) });
    } catch (err) {
        console.error("Error voting on poll:", err);
        res.status(500).json({ success: false, message: "Server error recording vote" });
    }
}

module.exports = { getSession, joinSession, createPoll, votePoll };