const { protect } = require("../middleware/authMiddleware");
const { getRoom, updateMessages, getYourRoom, loadRoom } = require("../controllers/rooms-controler");
const express = require("express");
const router = express.Router();

router.get("/all",protect, getYourRoom);
router.get("/:id", protect, getRoom);
router.post("/", protect, loadRoom)
router.put("/update/:id", protect, updateMessages);
module.exports = router;
