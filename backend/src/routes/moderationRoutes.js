const express = require("express");

const router = express.Router();

const moderationController = require("../controllers/moderationController");

router.get("/flagged", moderationController.flaggedQueue);
router.get("/hidden", moderationController.hiddenContent);
router.get("/users", moderationController.listUsers);
router.post("/users/:id/ban", moderationController.banUser);
router.post("/users/:id/unban", moderationController.unbanUser);
router.patch("/content/:id", moderationController.setContentVisibility);
router.post("/content/:id/resolve", moderationController.resolveContent);

module.exports = router;
