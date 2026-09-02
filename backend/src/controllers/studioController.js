const db = require("../data/mockData");

function serializePoll(poll) {
    const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0);
    return {
        ...poll,
        totalVotes,
        options: poll.options.map((option) => ({
            ...option,
            percent: totalVotes === 0 ? 0 : Math.round((option.votes / totalVotes) * 100)
        }))
    };
}

function findSession(id) {
    return db.studioSessions.find((s) => s.id === id) || null;
}

function serializeSession(session) {
    return {
        id: session.id,
        title: session.title,
        hostId: session.hostId,
        status: session.status,
        startedAt: session.startedAt,
        attendees: [...session.attendees],
        polls: session.polls.map(serializePoll),
        messages: [...session.messages].filter((m) => !m.deleted)
    };
}

function getSession(req, res) {
    const session = findSession(req.params.id);
    if (!session) {
        return res.status(404).json({ success: false, message: "Session not found" });
    }
    res.status(200).json({ success: true, data: serializeSession(session) });
}

function joinSession(req, res) {
    const session = findSession(req.params.id);
    if (!session) {
        return res.status(404).json({ success: false, message: "Session not found" });
    }
    let attendee = session.attendees.find((a) => a.userId === req.user.id);
    if (!attendee) {
        attendee = {
            userId: req.user.id,
            name: req.user.name,
            online: true,
            muted: true,
            cameraOn: false,
            raisedHand: false
        };
        session.attendees.push(attendee);
    } else {
        attendee.online = true;
    }
    res.status(200).json({ success: true, data: serializeSession(session) });
}

function createPoll(req, res) {
    const session = findSession(req.params.id);
    if (!session) {
        return res.status(404).json({ success: false, message: "Session not found" });
    }
    const question = String(req.body.question || "").trim();
    const rawOptions = Array.isArray(req.body.options) ? req.body.options : [];
    const options = rawOptions.map((text) => String(text).trim()).filter(Boolean).slice(0, 6);

    if (question.length < 5 || options.length < 2) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: {
                question: question.length < 5 ? "Question must be at least 5 characters" : undefined,
                options: options.length < 2 ? "At least 2 options are required" : undefined
            }
        });
    }

    const poll = {
        id: db.makeId("poll"),
        question,
        options: options.map((text) => ({ id: db.makeId("opt"), text, votes: 0 })),
        status: "open",
        createdAt: new Date().toISOString()
    };
    session.polls.push(poll);
    res.status(201).json({ success: true, data: serializePoll(poll) });
}

function votePoll(req, res) {
    let poll = null;
    for (let i = 0; i < db.studioSessions.length; i += 1) {
        const found = db.studioSessions[i].polls.find((p) => p.id === req.params.pollId);
        if (found) {
            poll = found;
            break;
        }
    }
    if (!poll) {
        return res.status(404).json({ success: false, message: "Poll not found" });
    }
    const option = poll.options.find((o) => o.id === req.body.optionId);
    if (!option) {
        return res.status(404).json({ success: false, message: "Poll option not found" });
    }

    // One vote per user; switching votes moves the previous one.
    if (!poll.voters) poll.voters = {};
    const previousOptionId = poll.voters[req.user.id];
    if (previousOptionId && previousOptionId !== option.id) {
        const previous = poll.options.find((o) => o.id === previousOptionId);
        if (previous && previous.votes > 0) previous.votes -= 1;
    }
    if (previousOptionId !== option.id) {
        option.votes += 1;
        poll.voters[req.user.id] = option.id;
    }

    res.status(200).json({ success: true, data: serializePoll(poll) });
}

module.exports = { getSession, joinSession, createPoll, votePoll, serializeSession };
