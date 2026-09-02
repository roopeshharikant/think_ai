const express = require("express");

const router = express.Router();

const categoryController = require("../controllers/categoryController");

router.get("/", categoryController.list);
router.post("/", categoryController.create);
router.put("/:id", categoryController.update);
router.delete("/:id", categoryController.remove);

module.exports = router;
