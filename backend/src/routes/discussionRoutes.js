const express = require("express");

const router = express.Router();

const discussionController = require("../controllers/discussionController");

router.get("/", discussionController.list);
router.post("/", discussionController.create);
router.get("/:id", discussionController.getOne);
router.post("/:id/vote", discussionController.vote);
router.patch("/:id/solved", discussionController.setSolved);
router.post("/:id/flag", discussionController.flag);

module.exports = router;
