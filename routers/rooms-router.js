const { protect } = require("../middleware/authMiddleware");
const { createRoom, getRoom, updateMessages, getYourRoom } = require("../controllers/rooms-controler");
const express = require("express");
const router = express.Router();

router.post("/create", protect, createRoom);
router.get("/all",protect, getYourRoom);
router.get("/:id", protect, getRoom);
router.put("/update/:id", protect, updateMessages);
module.exports = router;
