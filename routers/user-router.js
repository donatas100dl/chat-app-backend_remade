const {
  registerUser,
  login,
  getCurrentUser,
  getAllUsers,
  getAllUsersRooms,
} = require("../controllers/user-controller");
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

router.post("/", registerUser);
router.post("/login", login);
router.get("/", protect, getCurrentUser);
router.get("/chats", protect, getAllUsersRooms);
router.get("/all", getAllUsers)

module.exports = router;
