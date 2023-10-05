const {
  registerUser,
  login,
  getCurrentUser,
  getAllUsers,
} = require("../controllers/user-controller");
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

router.post("/", registerUser);
router.post("/login", login);
router.get("/", protect, getCurrentUser);
router.get("/all", getAllUsers)

module.exports = router;
