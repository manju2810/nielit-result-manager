const ALevelStudent = require("../models/ALevelStudent");
const OLevelStudent = require("../models/OLevelStudent");
const ResultHistory = require("../models/ResultHistory");

const ALL_SUBJECT_KEYS = {
  O_LEVEL: ["M1_R4", "M2_R4", "M3_R4", "M4_R4", "Project"],
  A_LEVEL: ["A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8", "A9", "A10", "PR5"],
};

// Subjects that MUST all be passed for an overall PASS (Project/PR5 excluded)
const CORE_SUBJECT_KEYS = {
  O_LEVEL: ["M1_R4", "M2_R4", "M3_R4", "M4_R4"],
  A_LEVEL: ["A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8", "A9", "A10"],
};

function getModel(course) {
  return course === "A_LEVEL" ? ALevelStudent : OLevelStudent;
}

/**
 * Shared rule for both courses: overall PASS only when ALL core subjects are PASS,
 * regardless of registration flag (Project/PR5 is excluded entirely from this check).
 *   - any core subject FAIL              -> FAIL
 *   - all core subjects ABSENT           -> ALL ABSENT
 *   - all core subjects PASS             -> PASS
 *   - otherwise (missing/pending/mixed)  -> RESULT PENDING
 */
function computeFinalStatus(course, subjectsObj) {
  const coreKeys = CORE_SUBJECT_KEYS[course];
  const statuses = coreKeys.map((k) => subjectsObj[k]?.latest_status || null);

  if (statuses.some((s) => s === "FAIL")) return "FAIL";
  if (statuses.every((s) => s === "ABSENT")) return "ALL ABSENT";
  if (statuses.every((s) => s === "PASS")) return "PASS";
  return "RESULT PENDING";
}

/**
 * Merge YN registration data + Result data for one course into the database.
 *
 * @param {"O_LEVEL"|"A_LEVEL"} course
 * @param {Map} ynMap        from parseYNFile (may be null if not uploaded this run)
 * @param {Map} resultMap    from parseResultFile (may be null if not uploaded this run)
 * @param {Object} examCycle Mongoose ExamCycle doc (already created)
 * @returns {Object} summary stats
 */
async function mergeCourseData(course, ynMap, resultMap, examCycle) {
  const Model = getModel(course);
  const subjectKeys = ALL_SUBJECT_KEYS[course];

  const allRegnNos = new Set([
    ...(ynMap ? ynMap.keys() : []),
    ...(resultMap ? resultMap.keys() : []),
  ]);

  let created = 0;
  let updated = 0;
  let historyRows = 0;

  for (const regn_no of allRegnNos) {
    const ynRow = ynMap ? ynMap.get(regn_no) : null;
    const resultRow = resultMap ? resultMap.get(regn_no) : null;

    let student = await Model.findOne({ regn_no });
    const isNew = !student;

    if (!student) {
      student = new Model({
        regn_no,
        name: ynRow?.name || resultRow?.name || "UNKNOWN",
      });
    }

    // Update identity fields if we have fresher info (YN file is the authoritative source for these)
    if (ynRow) {
      if (ynRow.roll_no) student.roll_no = ynRow.roll_no;
      if (ynRow.name) student.name = ynRow.name;
      if (ynRow.father_name) student.father_name = ynRow.father_name;
      if (ynRow.batch_no) student.batch_no = ynRow.batch_no;
      if (ynRow.exam_app_no) student.exam_app_no = ynRow.exam_app_no;

      // Mark registration status for this cycle (only overwrite keys present in this file)
      for (const key of Object.keys(ynRow.registered)) {
        if (!student.subjects[key]) continue;
        student.subjects[key].registered = ynRow.registered[key];
      }
    } else if (resultRow) {
      // Student appeared only in result file (no matching YN row this run)
      if (resultRow.roll_no && !student.roll_no) student.roll_no = resultRow.roll_no;
      if (resultRow.name) student.name = resultRow.name;
      if (resultRow.father_name && !student.father_name) student.father_name = resultRow.father_name;
    }

    // Apply results: update latest snapshot + queue history rows
    if (resultRow) {
      for (const subj of resultRow.subjects) {
        if (!student.subjects[subj.key]) continue; // unknown key, skip defensively
        student.subjects[subj.key].registered = true; // having a result implies registration
        student.subjects[subj.key].latest_grade = subj.grade;
        student.subjects[subj.key].latest_status = subj.status;
        student.subjects[subj.key].latest_subject_code = subj.raw_code;

        await ResultHistory.create({
          regn_no,
          course,
          exam_cycle_id: examCycle._id,
          cycle_name: examCycle.cycle_name,
          subject_key: subj.key,
          subject_code: subj.raw_code,
          grade: subj.grade,
          status: subj.status,
        });
        historyRows += 1;
      }
    }

    student.final_status = computeFinalStatus(course, student.subjects);

    await student.save();
    if (isNew) created += 1;
    else updated += 1;
  }

  return { created, updated, historyRows, totalStudents: allRegnNos.size };
}

module.exports = { mergeCourseData, ALL_SUBJECT_KEYS };