const express = require("express");
const router = express.Router();
const { listActivity } = require("../controllers/activityController");
const { protect } = require("../middleware/auth");
const { adminOnly } = require("../middleware/role");

router.get("/", protect, adminOnly, listActivity);

module.exports = router;