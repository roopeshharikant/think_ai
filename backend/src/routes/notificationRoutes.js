const express = require("express");

const router = express.Router();

const notificationController = require("../controllers/notificationController");

router.get("/", notificationController.list);
router.get("/preferences/:userId", notificationController.getPrefs);
router.put("/preferences/:userId", notificationController.savePrefs);
router.patch("/:id/read", notificationController.markRead);

module.exports = router;
