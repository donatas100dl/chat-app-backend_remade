const {
  registerUser,
  login,
  getCurrentUser,
} = require("../controllers/user-controller");
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

router.post("/", registerUser);
router.post("/login", login);
router.get("/me", protect, getCurrentUser);

module.exports = router;
