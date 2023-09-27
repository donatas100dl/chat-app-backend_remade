const { protect } = require("../middleware/authMiddleware");
const { createRoom, getRoom, updateMessages } = require("../controllers/rooms-controler");
const express = require("express");
const router = express.Router();

router.post("/create", protect, createRoom);
router.get("/:id", protect, getRoom);
router.put("/update/:id", protect, updateMessages);
module.exports = router;
