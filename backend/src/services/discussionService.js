const Discussion = require("../models/Discussion");
const db = require("../data/mockData");

const TITLE_MIN = 5;
const TITLE_MAX = 150;
const BODY_MIN = 10;
const BODY_MAX = 5000;

function validateDiscussionInput({ title, body }) {
    const errors = {};
    const trimmedTitle = String(title || "").trim();
    const trimmedBody = String(body || "").trim();

    if (!trimmedTitle) errors.title = "Title is required";
    else if (trimmedTitle.length < TITLE_MIN) errors.title = `Title must be at least ${TITLE_MIN} characters`;
    else if (trimmedTitle.length > TITLE_MAX) errors.title = `Title must be at most ${TITLE_MAX} characters`;

    if (!trimmedBody) errors.body = "Body is required";
    else if (trimmedBody.length < BODY_MIN) errors.body = `Body must be at least ${BODY_MIN} characters`;
    else if (trimmedBody.length > BODY_MAX) errors.body = `Body must be at most ${BODY_MAX} characters`;

    return { valid: Object.keys(errors).length === 0, errors, trimmedTitle, trimmedBody };
}

/**
 * Server-side search + filtering + sorting + pagination.
 * Designed to stay fast for thousands of posts (single pass over the archive).
 */
function listDiscussions(query, currentUserId) {
    const {
        search,
        tag,
        author,
        solved,
        categoryId,
        dateFrom,
        dateTo,
        sort,
        page,
        limit
    } = query;

    const searchText = String(search || "").trim().toLowerCase();
    const tagFilter = String(tag || "").trim().toLowerCase();
    const authorFilter = String(author || "").trim().toLowerCase();
    let solvedFilter = null;
    if (solved === "true" || solved === true) solvedFilter = true;
    else if (solved === "false" || solved === false) solvedFilter = false;

    const fromTime = dateFrom ? new Date(`${dateFrom}T00:00:00.000Z`).getTime() : null;
    const toTime = dateTo ? new Date(`${dateTo}T23:59:59.999Z`).getTime() : null;

    // Resolve the author filter against id, username and display name up front.
    let authorIds = null;
    if (authorFilter) {
        authorIds = new Set();
        db.users.forEach((u) => {
            if (
                u.id.toLowerCase().includes(authorFilter) ||
                u.username.toLowerCase().includes(authorFilter) ||
                u.name.toLowerCase().includes(authorFilter)
            ) {
                authorIds.add(u.id);
            }
        });
    }

    const filtered = [];
    const all = Discussion.listAll();

    for (let i = 0; i < all.length; i += 1) {
        const d = all[i];
        if (d.hidden) continue;
        if (searchText && !`${d.title}\n${d.body}`.toLowerCase().includes(searchText)) continue;
        if (tagFilter && !d.tags.some((t) => t.toLowerCase() === tagFilter)) continue;
        if (categoryId && d.categoryId !== categoryId) continue;
        if (solvedFilter !== null && d.solved !== solvedFilter) continue;
        if (authorIds && !authorIds.has(d.authorId)) continue;
        if (fromTime || toTime) {
            const created = new Date(d.createdAt).getTime();
            if (fromTime && created < fromTime) continue;
            if (toTime && created > toTime) continue;
        }
        filtered.push(d);
    }

    const items = filtered;

    const sortKey = sort || "recent";
    items.sort((a, b) => {
        if (sortKey === "votes") return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes);
        if (sortKey === "title") return a.title.localeCompare(b.title);
        if (sortKey === "views") return b.views - a.views;
        return new Date(b.createdAt) - new Date(a.createdAt);
    });

    const total = items.length;
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
    const totalPages = Math.max(Math.ceil(total / limitNum), 1);
    const pageNum = Math.min(Math.max(parseInt(page, 10) || 1, 1), totalPages);
    const start = (pageNum - 1) * limitNum;

    return {
        items: items.slice(start, start + limitNum).map((d) => Discussion.serialize(d, currentUserId)),
        page: pageNum,
        limit: limitNum,
        total,
        totalPages
    };
}

module.exports = { validateDiscussionInput, listDiscussions, TITLE_MIN, BODY_MIN };
