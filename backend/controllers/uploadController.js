const ExamCycle = require("../models/ExamCycle");
const ActivityLog = require("../models/ActivityLog");
const { parseYNFile, parseResultFile, parseStudentRegistrationFile } = require("../utils/excelParser");
const { mergeCourseData, mergeStudentRegistrationData } = require("../services/resultMergeService");

async function processOneCourse(course, files, cycleNameInput, userId) {
  const studentRegKey = course === "A_LEVEL" ? "a_student_reg" : "o_student_reg";
  const ynKey = course === "A_LEVEL" ? "a_yn" : "o_yn";
  const resultKey = course === "A_LEVEL" ? "a_result" : "o_result";

  const studentRegFile = files?.[studentRegKey]?.[0];
  const ynFile = files?.[ynKey]?.[0];
  const resultFile = files?.[resultKey]?.[0];

  if (!studentRegFile && !ynFile && !resultFile) return null; // nothing uploaded for this course

  let studentRegSummary = null;
  if (studentRegFile) {
    const regMap = await parseStudentRegistrationFile(studentRegFile.buffer);
    studentRegSummary = await mergeStudentRegistrationData(course, regMap);
  }

  let cycleSummary = null;
  if (ynFile || resultFile) {
    const ynMap = ynFile ? await parseYNFile(ynFile.buffer, course) : null;
    const { data: resultMap, skipped } = resultFile
      ? await parseResultFile(resultFile.buffer, course)
      : { data: null, skipped: [] };

    // Determine cycle name: prefer explicit input, else from YN file's Month_year_Level column
    let cycleName = cycleNameInput;
    if (!cycleName && ynMap) {
      const firstRow = ynMap.values().next().value;
      cycleName = firstRow?.cycle_name || null;
    }
    if (!cycleName) cycleName = `${course}_${new Date().toISOString().slice(0, 10)}`;

    const examCycle = await ExamCycle.create({
      cycle_name: cycleName,
      course,
      month_year: cycleName,
      uploaded_by: userId,
      status: "pending",
    });

    const summary = await mergeCourseData(course, ynMap, resultMap, examCycle);

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

// @desc   Upload Student Registration / Exam Registration (YN) / Result excel files
//         for O-Level and/or A-Level, process and merge into DB
// @route  POST /api/results/upload
// @access Protected (admin or user)
const uploadResults = async (req, res) => {
  try {
    const files = req.files || {};
    const { cycle_name } = req.body;

    const anyFileKeys = [
      "o_student_reg", "o_yn", "o_result",
      "a_student_reg", "a_yn", "a_result",
    ];
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
            parts.push(`Exam Cycle (${r.created} new, ${r.updated} updated, ${r.historyRows} subject results, ${r.improvedSubjects || 0} grade improvements)`);
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

module.exports = { uploadResults };