const express = require("express");

const router = express.Router();

const bookmarkController = require("../controllers/bookmarkController");

router.get("/", bookmarkController.list);
router.post("/", bookmarkController.add);
router.delete("/:userId/:discussionId", bookmarkController.remove);

module.exports = router;
