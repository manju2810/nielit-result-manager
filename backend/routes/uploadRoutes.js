const express = require("express");
const router = express.Router();
const { uploadResults } = require("../controllers/uploadController");
const { protect } = require("../middleware/auth");
const { uploadExcelFiles } = require("../middleware/upload");

router.post("/", protect, uploadExcelFiles, uploadResults);

module.exports = router;