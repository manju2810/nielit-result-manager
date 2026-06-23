const express = require("express");
const router = express.Router();
const { listUsers, createUser, setUserStatus } = require("../controllers/userController");
const { protect } = require("../middleware/auth");
const { adminOnly } = require("../middleware/role");

router.get("/", protect, adminOnly, listUsers);
router.post("/", protect, adminOnly, createUser);
router.patch("/:id/status", protect, adminOnly, setUserStatus);

module.exports = router;