/**
 * Forum module API router.
 *
 * Mounted from the main Thinkz backend with a single line:
 *   app.use("/api", require("./src/routes"));
 *
 * This exposes the required endpoints:
 *   /api/discussions, /api/comments, /api/categories,
 *   /api/bookmarks, /api/moderation, /api/notifications, /api/studio
 * without touching any other module's routes.
 */

const express = require("express");

const router = express.Router();

const { attachUser } = require("../middleware/authMiddleware");
const { forumErrorHandler } = require("../middleware/errorHandler");

router.use(attachUser);

router.use("/discussions", require("./discussionRoutes"));
router.use("/comments", require("./commentRoutes"));
router.use("/categories", require("./categoryRoutes"));
router.use("/bookmarks", require("./bookmarkRoutes"));
router.use("/notifications", require("./notificationRoutes"));
router.use("/moderation", require("./moderationRoutes"));
router.use("/studio", require("./studioRoutes"));

// Router-scoped 404 + error handling (does not affect other modules).
router.use((req, res) => {
    res.status(404).json({ success: false, message: `Forum route not found: ${req.method} ${req.originalUrl}` });
});
router.use(forumErrorHandler);

module.exports = router;
