const ExamCycle = require("../models/ExamCycle");
const ActivityLog = require("../models/ActivityLog");
const ResultHistory = require("../models/ResultHistory");
const ALevelStudent = require("../models/ALevelStudent");
const OLevelStudent = require("../models/OLevelStudent");
const RegistrationBatch = require("../models/RegistrationBatch");
const { parseResultFile, parseStudentRegistrationFile } = require("../utils/excelParser");
const { mergeCourseData, mergeStudentRegistrationData } = require("../services/resultMergeService");

const CORE_SUBJECT_KEYS = {
  O_LEVEL: ["M1_R4", "M2_R4", "M3_R4", "M4_R4"],
  A_LEVEL: ["A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8", "A9", "A10"],
};

function getModel(course) {
  return course === "A_LEVEL" ? ALevelStudent : OLevelStudent;
}

function computeFinalStatus(course, subjectsObj) {
  const coreKeys = CORE_SUBJECT_KEYS[course];
  const statuses = coreKeys.map((k) => subjectsObj[k]?.latest_status || null);
  if (statuses.some((s) => s === "FAIL")) return "FAIL";
  if (statuses.every((s) => s === "ABSENT")) return "ALL ABSENT";
  if (statuses.every((s) => s === "PASS")) return "PASS";
  return "RESULT PENDING";
}

const deleteExamCycle = async (req, res) => {
  try {
    const { id } = req.params;

    const examCycle = await ExamCycle.findById(id);
    if (!examCycle) {
      return res.status(404).json({ success: false, message: "Exam cycle not found" });
    }

    const course = examCycle.course;
    const Model = getModel(course);

    const cycleHistories = await ResultHistory.find({ exam_cycle_id: id });

    const studentMap = {};
    for (const h of cycleHistories) {
      if (!studentMap[h.regn_no]) studentMap[h.regn_no] = [];
      studentMap[h.regn_no].push(h.subject_key);
    }

    await ResultHistory.deleteMany({ exam_cycle_id: id });

    for (const [regn_no, subjectKeys] of Object.entries(studentMap)) {
      const student = await Model.findOne({ regn_no });
      if (!student) continue;

      for (const subjectKey of [...new Set(subjectKeys)]) {
        const remaining = await ResultHistory.find({
          regn_no,
          course,
          subject_key: subjectKey,
        }).sort({ createdAt: -1 });

        if (remaining.length === 0) {
          student.subjects[subjectKey].latest_grade = null;
          student.subjects[subjectKey].latest_status = null;
          student.subjects[subjectKey].latest_subject_code = null;
          student.subjects[subjectKey].registered = false;
        } else {
          const GRADE_RANK = { A: 5, B: 4, C: 3, D: 2, F: 1, ABS: 0 };
          const best = remaining.reduce((prev, curr) => {
            const prevRank = GRADE_RANK[(prev.grade || "").toUpperCase()] ?? -1;
            const currRank = GRADE_RANK[(curr.grade || "").toUpperCase()] ?? -1;
            return currRank > prevRank ? curr : prev;
          });

          await ResultHistory.updateMany(
            { regn_no, course, subject_key: subjectKey },
            { $set: { is_best: false } }
          );
          await ResultHistory.findByIdAndUpdate(best._id, { $set: { is_best: true } });

          student.subjects[subjectKey].latest_grade = best.grade;
          student.subjects[subjectKey].latest_status = best.status;
          student.subjects[subjectKey].latest_subject_code = best.subject_code;
          student.subjects[subjectKey].registered = true;
        }
      }

      student.final_status = computeFinalStatus(course, student.subjects);
      await student.save();
    }

    await ExamCycle.findByIdAndDelete(id);

    await ActivityLog.create({
      user_id: req.user._id,
      user_name: req.user.name,
      user_email: req.user.email,
      role: req.user.role,
      action: "DELETE",
      course,
      details: `Deleted exam cycle "${examCycle.cycle_name}" and rolled back ${Object.keys(studentMap).length} students' grades`,
      ip_address: req.ip,
    });

    res.status(200).json({
      success: true,
      message: `Exam cycle "${examCycle.cycle_name}" deleted and ${Object.keys(studentMap).length} students' grades rolled back successfully`,
      affectedStudents: Object.keys(studentMap).length,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   List registration batches uploaded so far
// @route  GET /api/results/registration-batches?course=
// @access Protected
const listRegistrationBatches = async (req, res) => {
  try {
    const { course } = req.query;
    const filter = course ? { course } : {};
    const batches = await RegistrationBatch.find(filter)
      .sort({ createdAt: -1 })
      .populate("uploaded_by", "name email");
    res.status(200).json({ success: true, batches });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Delete a registration batch. Only newly-created students in that
//         batch are removed (safe). Students that were merely updated by
//         this batch CANNOT be reverted since their prior values were not
//         stored — these are reported back but left untouched.
// @route  DELETE /api/results/registration-batches/:id
// @access Protected (admin only)
const deleteRegistrationBatch = async (req, res) => {
  try {
    const { id } = req.params;

    const batch = await RegistrationBatch.findById(id);
    if (!batch) {
      return res.status(404).json({ success: false, message: "Registration batch not found" });
    }
    if (batch.status === "reverted") {
      return res.status(400).json({ success: false, message: "This batch has already been reverted" });
    }

    const Model = getModel(batch.course);

    const deleteResult = await Model.deleteMany({
      regn_no: { $in: batch.created_regn_nos },
    });

    batch.status = "reverted";
    await batch.save();

    await ActivityLog.create({
      user_id: req.user._id,
      user_name: req.user.name,
      user_email: req.user.email,
      role: req.user.role,
      action: "DELETE",
      course: batch.course,
      details: `Reverted registration batch "${batch.batch_name}": removed ${deleteResult.deletedCount} newly-created student(s). ${batch.updated_regn_nos.length} previously-existing student(s) were updated by this batch and could NOT be reverted (no history stored).`,
      ip_address: req.ip,
    });

    res.status(200).json({
      success: true,
      message: `Removed ${deleteResult.deletedCount} newly-created student(s) from batch "${batch.batch_name}".`,
      deletedCount: deleteResult.deletedCount,
      unrevertedUpdatedCount: batch.updated_regn_nos.length,
      unrevertedUpdatedRegnNos: batch.updated_regn_nos,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

async function processOneCourse(course, files, cycleNameInput, userId) {
  const studentRegKey = course === "A_LEVEL" ? "a_student_reg" : "o_student_reg";
  const resultKey = course === "A_LEVEL" ? "a_result" : "o_result";

  const studentRegFile = files?.[studentRegKey]?.[0];
  const resultFile = files?.[resultKey]?.[0];

  if (!studentRegFile && !resultFile) return null;

  // Process student registration file independently
  let studentRegSummary = null;
  if (studentRegFile) {
    const regMap = await parseStudentRegistrationFile(studentRegFile.buffer);
    studentRegSummary = await mergeStudentRegistrationData(course, regMap);

    // Record this upload as a batch so it can later be identified / partially rolled back
    const batchName = cycleNameInput || `${course}_registration_${new Date().toISOString().slice(0, 10)}`;
    const regBatch = await RegistrationBatch.create({
      batch_name: batchName,
      course,
      uploaded_by: userId,
      created_regn_nos: studentRegSummary.created_regn_nos,
      updated_regn_nos: studentRegSummary.updated_regn_nos,
    });
    studentRegSummary.batchId = regBatch._id;
    studentRegSummary.batchName = batchName;
  }

  // Process result file
  let cycleSummary = null;
  if (resultFile) {
    const { data: resultMap, skipped } = await parseResultFile(resultFile.buffer, course);

    // Cycle name from input or auto-generate
    let cycleName = cycleNameInput;
    if (!cycleName) cycleName = `${course}_${new Date().toISOString().slice(0, 10)}`;

    const examCycle = await ExamCycle.create({
      cycle_name: cycleName,
      course,
      month_year: cycleName,
      uploaded_by: userId,
      status: "pending",
    });

    // Pass null for ynMap since we no longer use YN file
    const summary = await mergeCourseData(course, null, resultMap, examCycle);

    examCycle.status = "processed";
    await examCycle.save();

    cycleSummary = {
      cycleName,
      examCycleId: examCycle._id,
      ...summary,
      skippedResultRows: skipped.length,
      skippedSamples: skipped.slice(0, 5),
    };
  }

  return {
    course,
    studentRegistration: studentRegSummary,
    ...(cycleSummary || {}),
  };
}

const uploadResults = async (req, res) => {
  try {
    const files = req.files || {};
    const { cycle_name } = req.body;

    const anyFileKeys = ["o_student_reg", "o_result", "a_student_reg", "a_result"];
    const hasAnyFile = anyFileKeys.some((k) => files[k]?.[0]);
    if (!hasAnyFile) {
      return res.status(400).json({
        success: false,
        message: "No files uploaded. Provide at least one of: " + anyFileKeys.join(", "),
      });
    }

    const results = [];
    const oResult = await processOneCourse("O_LEVEL", files, cycle_name, req.user._id);
    if (oResult) results.push(oResult);
    const aResult = await processOneCourse("A_LEVEL", files, cycle_name, req.user._id);
    if (aResult) results.push(aResult);

    await ActivityLog.create({
      user_id: req.user._id,
      user_name: req.user.name,
      user_email: req.user.email,
      role: req.user.role,
      action: "UPLOAD",
      course: results[0]?.course || null,
      cycle_name: results.map((r) => r.cycleName).filter(Boolean).join(", "),
      details: `Uploaded files: ${results
        .map((r) => {
          const parts = [];
          if (r.studentRegistration) {
            parts.push(`Student Reg (${r.studentRegistration.created} new, ${r.studentRegistration.updated} updated)`);
          }
          if (r.historyRows !== undefined) {
            parts.push(`Result (${r.created} new, ${r.updated} updated, ${r.historyRows} subject results)`);
          }
          return `${r.course}: ${parts.join(", ")}`;
        })
        .join("; ")}`,
      ip_address: req.ip,
    });

    res.status(200).json({
      success: true,
      message: "Files processed successfully",
      results,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  uploadResults,
  deleteExamCycle,
  listRegistrationBatches,
  deleteRegistrationBatch,
};
