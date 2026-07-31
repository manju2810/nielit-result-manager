const ALevelStudent = require("../models/ALevelStudent");
const OLevelStudent = require("../models/OLevelStudent");
const ResultHistory = require("../models/ResultHistory");

const ALL_SUBJECT_KEYS = {
  O_LEVEL: ["M1_R4", "M2_R4", "M3_R4", "M4_R4", "Project"],
  A_LEVEL: ["A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8", "A9", "A10", "PR5"],
};

const CORE_SUBJECT_KEYS = {
  O_LEVEL: ["M1_R4", "M2_R4", "M3_R4", "M4_R4"],
  A_LEVEL: ["A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8", "A9", "A10"],
};

const GRADE_RANK = { A: 5, B: 4, C: 3, D: 2, F: 1, ABS: 0 };

function gradeRank(grade) {
  return GRADE_RANK[(grade || "").toUpperCase()] ?? -1;
}

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

/**
 * Merge a Student Registration (enrollment) file into the database.
 * Tracks which regn_nos were newly created vs. updated, so the batch
 * can later be identified and (partially) rolled back.
 */
async function mergeStudentRegistrationData(course, regMap) {
  const Model = getModel(course);
  let created = 0;
  let updated = 0;
  const created_regn_nos = [];
  const updated_regn_nos = [];

  for (const [regn_no, row] of regMap.entries()) {
    let student = await Model.findOne({ regn_no });
    const isNew = !student;

    if (!student) {
      student = new Model({ regn_no, name: row.name || "UNKNOWN" });
    }

    if (row.name) student.name = row.name;
    if (row.father_name) student.father_name = row.father_name;
    if (row.mother_name) student.mother_name = row.mother_name;
    if (row.dob) student.dob = row.dob;
    if (row.enrollment_app_no) student.enrollment_app_no = row.enrollment_app_no;
    if (row.batch) student.enrollment_batch = row.batch;
    if (row.expiry_date) student.expiry_date = row.expiry_date;
    if (row.address) student.address = row.address;
    if (row.city) student.city = row.city;
    if (row.state) student.state = row.state;
    if (row.pincode) student.pincode = row.pincode;

    await student.save();
    if (isNew) {
      created += 1;
      created_regn_nos.push(regn_no);
    } else {
      updated += 1;
      updated_regn_nos.push(regn_no);
    }
  }

  return {
    created,
    updated,
    totalStudents: regMap.size,
    created_regn_nos,
    updated_regn_nos,
  };
}

/**
 * Merge Exam Registration (YN) + Result data for one course into the database.
 * Best grade logic: only update if new grade is better than existing.
 */
async function mergeCourseData(course, ynMap, resultMap, examCycle) {
  const Model = getModel(course);

  const allRegnNos = new Set([
    ...(ynMap ? ynMap.keys() : []),
    ...(resultMap ? resultMap.keys() : []),
  ]);

  let created = 0;
  let updated = 0;
  let historyRows = 0;
  let improvedSubjects = 0;

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

    if (ynRow) {
      if (ynRow.roll_no) student.roll_no = ynRow.roll_no;
      if (ynRow.name) student.name = ynRow.name;
      if (ynRow.father_name) student.father_name = ynRow.father_name;
      if (ynRow.batch_no) student.batch_no = ynRow.batch_no;
      if (ynRow.exam_app_no) student.exam_app_no = ynRow.exam_app_no;

      for (const key of Object.keys(ynRow.registered)) {
        if (!student.subjects[key]) continue;
        student.subjects[key].registered = ynRow.registered[key];
      }
    } else if (resultRow) {
      if (resultRow.roll_no && !student.roll_no) student.roll_no = resultRow.roll_no;
      if (resultRow.name) student.name = resultRow.name;
      if (resultRow.father_name && !student.father_name) student.father_name = resultRow.father_name;
      if (resultRow.category && !student.category) student.category = resultRow.category;
    }

    if (resultRow) {
      for (const subj of resultRow.subjects) {
        if (!student.subjects[subj.key]) continue;
        student.subjects[subj.key].registered = true;

        const existingGrade = student.subjects[subj.key].latest_grade;
        const isFirstAttempt = !existingGrade;
        const isBetter = gradeRank(subj.grade) > gradeRank(existingGrade);
        const becomesNewBest = isFirstAttempt || isBetter;

        if (becomesNewBest) {
          student.subjects[subj.key].latest_grade = subj.grade;
          student.subjects[subj.key].latest_status = subj.status;
          student.subjects[subj.key].latest_subject_code = subj.raw_code;
          if (!isFirstAttempt) {
            improvedSubjects += 1;
            await ResultHistory.updateMany(
              { regn_no, course, subject_key: subj.key, is_best: true },
              { $set: { is_best: false } }
            );
          }
        }

        await ResultHistory.create({
          regn_no,
          course,
          exam_cycle_id: examCycle._id,
          cycle_name: examCycle.cycle_name,
          subject_key: subj.key,
          subject_code: subj.raw_code,
          grade: subj.grade,
          status: subj.status,
          is_best: becomesNewBest,
        });
        historyRows += 1;
      }
    }

    student.final_status = computeFinalStatus(course, student.subjects);

    await student.save();
    if (isNew) created += 1;
    else updated += 1;
  }

  return { created, updated, historyRows, improvedSubjects, totalStudents: allRegnNos.size };
}

module.exports = { mergeCourseData, mergeStudentRegistrationData, ALL_SUBJECT_KEYS, gradeRank };
