const express = require("express");
const router = express.Router();
const { listStudents, listBatches, getStudent, exportStudents, listCycles } = require("../controllers/resultController");
const { deleteExamCycle } = require("../controllers/uploadController");
const { protect } = require("../middleware/auth");
const { adminOnly } = require("../middleware/role");

router.get("/students", protect, listStudents);
router.get("/batches", protect, listBatches);
router.get("/export", protect, exportStudents);
router.get("/students/:regn_no", protect, getStudent);
router.get("/cycles", protect, listCycles);
router.delete("/cycles/:id", protect, adminOnly, deleteExamCycle);

module.exports = router;