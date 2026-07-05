const express = require("express");
const router = express.Router();
const { listStudents, listBatches, getStudent, exportStudents, listCycles } = require("../controllers/resultController");
const { protect } = require("../middleware/auth");

router.get("/students", protect, listStudents);
router.get("/batches", protect, listBatches);
router.get("/export", protect, exportStudents);
router.get("/students/:regn_no", protect, getStudent);
router.get("/cycles", protect, listCycles);

module.exports = router;