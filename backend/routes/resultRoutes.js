const express = require("express");
const router = express.Router();
const { listStudents, listBatches, getStudent, exportStudents, listCycles } = require("../controllers/resultController");
const { protect } = require("../middleware/auth");
const { deleteExamCycle } = require("../controllers/uploadController");
const { authorize } = require("../middleware/role"); // or whatever your admin check is called

router.delete("/cycles/:id", protect, authorize("admin"), deleteExamCycle);

router.get("/students", protect, listStudents);
router.get("/batches", protect, listBatches);
router.get("/export", protect, exportStudents);
router.get("/students/:regn_no", protect, getStudent);
router.get("/cycles", protect, listCycles);

module.exports = router;