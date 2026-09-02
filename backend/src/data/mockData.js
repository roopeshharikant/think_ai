/**
 * Forum module mock data layer (in-memory).
 *
 * Everything the Forum / Live Studio / Moderation features need lives here so
 * the module stays fully self-contained from other Thinkz AI modules.
 */

const crypto = require("crypto");

function makeId(prefix) {
    return `${prefix}_${crypto.randomUUID()}`;
}

// ---------------------------------------------------------------------------
// Deterministic pseudo-random generator (stable seed data between restarts)
// ---------------------------------------------------------------------------

function mulberry32(seed) {
    let a = seed;
    return function next() {
        a |= 0;
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

const rand = mulberry32(20260824);

function pick(list) {
    return list[Math.floor(rand() * list.length)];
}

function randInt(min, max) {
    return min + Math.floor(rand() * (max - min + 1));
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

const users = [
    { id: "u1", name: "Aarav Sharma", username: "aarav", email: "aarav@thinkz.ai", role: "Learner", banned: false },
    { id: "u2", name: "Priya Nair", username: "priya", email: "priya@thinkz.ai", role: "Learner", banned: false },
    { id: "u3", name: "Rahul Verma", username: "rahul", email: "rahul@thinkz.ai", role: "Instructor", banned: false },
    { id: "u4", name: "Sneha Iyer", username: "sneha", email: "sneha@thinkz.ai", role: "Learner", banned: false },
    { id: "u5", name: "Vikram Rao", username: "vikram", email: "vikram@thinkz.ai", role: "TA", banned: false },
    { id: "u6", name: "Meera Joshi", username: "meera", email: "meera@thinkz.ai", role: "Moderator", banned: false },
    { id: "u7", name: "Dev Patel", username: "devpatel", email: "dev@thinkz.ai", role: "Learner", banned: false },
    { id: "u8", name: "Admin One", username: "admin", email: "admin@thinkz.ai", role: "Admin", banned: false }
];

const AVATAR_COLORS = ["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#06b6d4", "#ef4444", "#8b5cf6"];

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

const categories = [
    { id: "c-general", name: "General", color: "#6366f1", description: "Community-wide discussions" },
    { id: "c-announcements", name: "Announcements", color: "#f59e0b", description: "Official platform updates" },
    { id: "c-qa", name: "Q&A", color: "#10b981", description: "Ask questions and get answers" },
    { id: "c-projects", name: "Projects", color: "#06b6d4", description: "Show what you are building" },
    { id: "c-help", name: "Help & Support", color: "#ef4444", description: "Platform help and troubleshooting" }
];

// ---------------------------------------------------------------------------
// Discussions
// ---------------------------------------------------------------------------

const TAG_POOL = ["react", "nodejs", "javascript", "css", "api", "database", "testing", "career", "ai", "devtools"];
const TITLE_TEMPLATES = [
    "How do I handle %TOPIC% in %STACK%?",
    "Best practices for %TOPIC% with %STACK%",
    "Understanding %TOPIC% — a deep dive",
    "%STACK% %TOPIC% keeps failing, any ideas?",
    "Showcase: my %TOPIC% project built with %STACK%",
    "Tips for debugging %TOPIC% in %STACK%",
    "%TOPIC% vs alternatives in %STACK%",
    "Getting started with %TOPIC% (%STACK% edition)"
];
const TOPICS = ["state management", "pagination", "websockets", "authentication", "caching", "optimistic UI", "server-side filtering", "error boundaries", "responsive layouts", "unit testing"];
const STACKS = ["React", "Node.js", "Express", "Vite", "PostgreSQL", "Socket.IO"];
const BODY_SENTENCES = [
    "I have been experimenting with this for a few days and wanted to share what worked.",
    "Here is a minimal reproduction of the issue I am running into.",
    "Would love to hear how others on the platform approach this problem.",
    "The docs cover the basics but skip the edge cases entirely.",
    "Profiling shows the bottleneck appears only after a few hundred records.",
    "Adding proper error handling fixed most of the flakiness for me.",
    "@priya mentioned this pattern last week and it finally clicked for me.",
    "Happy to open a pull request if the maintainers agree with the approach.",
    "Update: downgrading the dependency resolved the crash on startup.",
    "Any pointers to official documentation would be really appreciated."
];

const DAY_MS = 24 * 60 * 60 * 1000;
const NOW = Date.UTC(2026, 7, 24, 12, 0, 0);

function isoAgo(days, hourOffset) {
    return new Date(NOW - days * DAY_MS + (hourOffset || 0) * 3600 * 1000).toISOString();
}

const discussions = [];

function addDiscussion(d) {
    const now = d.createdAt || new Date().toISOString();
    discussions.push({
        id: d.id || makeId("d"),
        title: d.title,
        body: d.body,
        authorId: d.authorId,
        tags: d.tags || [],
        categoryId: d.categoryId || "c-general",
        createdAt: now,
        updatedAt: now,
        solved: Boolean(d.solved),
        hidden: Boolean(d.hidden),
        flagged: Boolean(d.flagged),
        flagReason: d.flagReason || null,
        views: d.views != null ? d.views : randInt(12, 900),
        upvotes: d.upvotes != null ? d.upvotes : randInt(0, 48),
        downvotes: d.downvotes != null ? d.downvotes : randInt(0, 6)
    });
}

// Handcrafted seed threads (referenced by comments below).
addDiscussion({
    id: "d1",
    title: "Welcome to the Thinkz AI Community — start here!",
    body:
        "Introduce yourself in the comments and tell us what you are learning.\n\n" +
        "Community guidelines:\n" +
        "1. Be kind and constructive\n2. Search before posting\n3. Use tags so others can filter topics\n" +
        "4. Mark a thread as solved when your question is answered (@moderator will help if not)",
    authorId: "u8",
    tags: ["community", "welcome"],
    categoryId: "c-announcements",
    createdAt: isoAgo(180),
    upvotes: 132,
    downvotes: 2,
    solved: true,
    views: 4021
});

addDiscussion({
    id: "d2",
    title: "Optimistic UI for voting — how to roll back cleanly when the API fails?",
    body:
        "I am building upvote/downvote buttons with optimistic updates.\n\n" +
        "The happy path is easy, but what is the cleanest way to revert the UI " +
        "when POST /vote fails? Snapshotting previous state in a ref feels hacky.",
    authorId: "u1",
    tags: ["react", "optimistic-ui", "api"],
    categoryId: "c-qa",
    createdAt: isoAgo(2, -3),
    upvotes: 27,
    downvotes: 1
});

addDiscussion({
    id: "d3",
    title: "Forum search stays fast at 1000+ posts — sharing our server-side filtering notes",
    body:
        "We benchmarked text + tag + author + date filtering with pagination on the server " +
        "instead of shipping every post to the client. Response times stayed under 30ms for 1200 seeded posts.",
    authorId: "u5",
    tags: ["search", "api", "performance"],
    categoryId: "c-projects",
    createdAt: isoAgo(6),
    upvotes: 41,
    downvotes: 0,
    solved: true
});

addDiscussion({
    id: "d4",
    title: "Live Class Studio: chat over WebSocket drops messages on reconnect",
    body: "When the socket reconnects mid-session some chat messages vanish. Should we replay history from the session API after reconnect?",
    authorId: "u4",
    tags: ["websocket", "live-studio"],
    categoryId: "c-help",
    createdAt: isoAgo(1, -5),
    upvotes: 9,
    downvotes: 0
});

addDiscussion({
    id: "d5",
    title: "Spam: BUY CHEAP COURSE ACCESS NOW!!!",
    body: "Limited offer, click this very suspicious link!!!",
    authorId: "u7",
    tags: ["spam"],
    categoryId: "c-general",
    createdAt: isoAgo(0, -8),
    upvotes: 0,
    downvotes: 14,
    flagged: true,
    flagReason: "Spam / advertising"
});

// Generated archive so search/filter/pagination can be validated at scale.
for (let i = 0; i < 1120; i += 1) {
    const template = pick(TITLE_TEMPLATES);
    const title = template
        .replace("%TOPIC%", pick(TOPICS))
        .replace("%STACK%", pick(STACKS));
    const sentences = [];
    for (let s = 0; s < randInt(2, 4); s += 1) {
        sentences.push(pick(BODY_SENTENCES));
    }
    addDiscussion({
        id: `dg${i + 1}`,
        title: `${title} (#${i + 1})`,
        body: sentences.join(" "),
        authorId: pick(users).id,
        tags: [pick(TAG_POOL), pick(TAG_POOL)].filter((t, idx, arr) => arr.indexOf(t) === idx),
        categoryId: pick(categories).id,
        createdAt: isoAgo(randInt(1, 175), randInt(-11, 11)),
        solved: rand() < 0.22,
        flagged: rand() < 0.02 ? true : false,
        flagReason: rand() < 0.02 ? pick(["Spam / advertising", "Off-topic", "Inappropriate language"]) : null
    });
}

// ---------------------------------------------------------------------------
// Comments
// ---------------------------------------------------------------------------

const comments = [
    {
        id: "cm1",
        discussionId: "d1",
        parentId: null,
        body: "Hi everyone! @aarav here — excited to learn full-stack development with all of you.",
        authorId: "u1",
        createdAt: isoAgo(179),
        flagged: false,
        hidden: false
    },
    {
        id: "cm2",
        discussionId: "d1",
        parentId: null,
        body: "Joining from Bengaluru. The Q&A category already saved me twice this week.",
        authorId: "u2",
        createdAt: isoAgo(178),
        flagged: false,
        hidden: false
    },
    {
        id: "cm3",
        discussionId: "d2",
        parentId: null,
        body: "Snapshot the previous value before you mutate it — then restore it inside the catch block. Works great with useRef.",
        authorId: "u3",
        createdAt: isoAgo(1, -2),
        flagged: false,
        hidden: false
    },
    {
        id: "cm4",
        discussionId: "d2",
        parentId: null,
        body: "@rahul that is exactly what we ended up doing. Marking this solved, thanks!",
        authorId: "u1",
        createdAt: isoAgo(0, -4),
        flagged: false,
        hidden: false
    },
    {
        id: "cm5",
        discussionId: "d3",
        parentId: null,
        body: "Server-side filtering plus indexed pagination is the way. Nice write-up @vikram.",
        authorId: "u6",
        createdAt: isoAgo(5),
        flagged: false,
        hidden: false
    },
    {
        id: "cm6",
        discussionId: "d4",
        parentId: null,
        body: "Yes — refetch history on reconnect and de-duplicate by message id.",
        authorId: "u5",
        createdAt: isoAgo(0, -6),
        flagged: false,
        hidden: false
    },
    {
        id: "cm7",
        discussionId: "d2",
        parentId: null,
        body: "Totally unrelated promo link here, sorry.",
        authorId: "u7",
        createdAt: isoAgo(0, -3),
        flagged: true,
        hidden: false
    }
];

// A little extra comment traffic on generated threads.
for (let i = 0; i < 140; i += 1) {
    const target = `dg${randInt(1, 400)}`;
    comments.push({
        id: makeId("cm"),
        discussionId: target,
        parentId: null,
        body: pick([
            "Following this thread, same question here.",
            "This helped me unblock a similar issue, thanks!",
            "Have you tried profiling before and after the change?",
            "Bookmarking for later — great explanation.",
            "@priya ran into the same thing yesterday."
        ]),
        authorId: pick(users).id,
        createdAt: isoAgo(randInt(0, 20), randInt(-11, 11)),
        flagged: false,
        hidden: false
    });
}

// ---------------------------------------------------------------------------
// Votes (userId -> 'up' | 'down') persisted per discussion
// ---------------------------------------------------------------------------

const votes = new Map();

function votesFor(discussionId) {
    if (!votes.has(discussionId)) {
        votes.set(discussionId, new Map());
    }
    return votes.get(discussionId);
}

// Seed a few real user votes so userVote hydration has data.
votesFor("d2").set("u3", "up");
votesFor("d3").set("u1", "up");
votesFor("d5").set("u1", "down");

// ---------------------------------------------------------------------------
// Bookmarks
// ---------------------------------------------------------------------------

const bookmarks = [
    { id: makeId("bk"), userId: "u1", discussionId: "d3", createdAt: isoAgo(4) },
    { id: makeId("bk"), userId: "u1", discussionId: "d2", createdAt: isoAgo(1) },
    { id: makeId("bk"), userId: "u2", discussionId: "d1", createdAt: isoAgo(30) }
];

// ---------------------------------------------------------------------------
// Notifications + preferences
// ---------------------------------------------------------------------------

const notifications = [
    {
        id: makeId("n"),
        userId: "u1",
        type: "mention",
        message: "rahul mentioned you in “Optimistic UI for voting…”",
        link: "/forum/d2",
        read: false,
        createdAt: isoAgo(1, -2)
    },
    {
        id: makeId("n"),
        userId: "u1",
        type: "system",
        message: "Welcome to the Thinkz AI community!",
        link: "/forum",
        read: true,
        createdAt: isoAgo(170)
    }
];

const notificationPrefs = {};
users.forEach((user, index) => {
    notificationPrefs[user.id] = {
        email: index % 2 === 0,
        inApp: true,
        sms: index % 3 === 0
    };
});

// ---------------------------------------------------------------------------
// Live Class Studio sessions
// ---------------------------------------------------------------------------

const studioSessions = [
    {
        id: "s1",
        title: "React Hooks Deep Dive — Live Class",
        hostId: "u3",
        status: "live",
        startedAt: isoAgo(0, -1),
        attendees: [
            { userId: "u3", name: "Rahul Verma", online: true, muted: false, cameraOn: true, raisedHand: false },
            { userId: "u1", name: "Aarav Sharma", online: true, muted: true, cameraOn: false, raisedHand: false },
            { userId: "u2", name: "Priya Nair", online: true, muted: true, cameraOn: true, raisedHand: true },
            { userId: "u4", name: "Sneha Iyer", online: false, muted: true, cameraOn: false, raisedHand: false },
            { userId: "u7", name: "Dev Patel", online: true, muted: true, cameraOn: false, raisedHand: false }
        ],
        polls: [
            {
                id: makeId("poll"),
                question: "Which hook should we refactor first?",
                options: [
                    { id: makeId("opt"), text: "useState", votes: 7 },
                    { id: makeId("opt"), text: "useEffect", votes: 11 },
                    { id: makeId("opt"), text: "useMemo", votes: 3 }
                ],
                status: "open",
                createdAt: isoAgo(0, -1)
            }
        ],
        messages: [
            { id: makeId("msg"), userId: "u3", userName: "Rahul Verma", text: "Welcome everyone! We start with custom hooks.", timestamp: isoAgo(0, -1), deleted: false },
            { id: makeId("msg"), userId: "u2", userName: "Priya Nair", text: "Audio is clear on my side.", timestamp: isoAgo(0, -1), deleted: false },
            { id: makeId("msg"), userId: "u1", userName: "Aarav Sharma", text: "Can we revisit the cleanup function example?", timestamp: isoAgo(0), deleted: false }
        ]
    }
];

module.exports = {
    makeId,
    users,
    avatarColors: AVATAR_COLORS,
    categories,
    discussions,
    comments,
    votesFor,
    bookmarks,
    notifications,
    notificationPrefs,
    studioSessions
};
