const express = require("express");
const router = express.Router();
const { listStudents, getStudent, exportStudents, listCycles } = require("../controllers/resultController");
const { deleteExamCycle, listRegistrationBatches, deleteRegistrationBatch } = require("../controllers/uploadController");
const { protect } = require("../middleware/auth");
const { adminOnly } = require("../middleware/role");

router.get("/students", protect, listStudents);
router.get("/export", protect, exportStudents);
router.get("/students/:regn_no", protect, getStudent);
router.get("/cycles", protect, listCycles);
router.delete("/cycles/:id", protect, adminOnly, deleteExamCycle);
router.get("/registration-batches", protect, listRegistrationBatches);
router.delete("/registration-batches/:id", protect, adminOnly, deleteRegistrationBatch);

module.exports = router;
