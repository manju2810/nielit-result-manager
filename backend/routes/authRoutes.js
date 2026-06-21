const express = require("express");
const router = express.Router();
const { login, logout } = require("../controllers/authController");
const { protect } = require("../middleware/auth");

// Public route
router.post("/login", login);

// Protected route
router.post("/logout", protect, logout);

module.exports = router;