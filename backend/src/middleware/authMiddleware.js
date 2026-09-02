/**
 * Mock auth middleware for the self-contained Forum module.
 *
 * The real Thinkz auth module is intentionally left untouched. Forum requests
 * identify the current user via the `x-user-id` header (or `userId` in the
 * body/query) and fall back to the demo user "u1" when absent.
 */

const User = require("../models/User");

const DEFAULT_USER_ID = "u1";

function resolveUserId(req) {
    const headerId = req.headers["x-user-id"];
    const queryId = req.query && req.query.userId;
    const bodyId = req.body && req.body.userId;
    return (headerId || bodyId || queryId || DEFAULT_USER_ID).toString();
}

function attachUser(req, _res, next) {
    req.user = User.findById(resolveUserId(req)) || User.findById(DEFAULT_USER_ID);
    next();
}

module.exports = { attachUser, resolveUserId, DEFAULT_USER_ID };
