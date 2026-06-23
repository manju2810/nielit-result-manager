const express = require("express");
const router = express.Router();
const { listStudents, getStudent, listCycles } = require("../controllers/resultController");
const { protect } = require("../middleware/auth");

router.get("/students", protect, listStudents);
router.get("/students/:regn_no", protect, getStudent);
router.get("/cycles", protect, listCycles);

module.exports = router;