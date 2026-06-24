const dotenv = require("dotenv");
dotenv.config();

const connectDB = require("../config/db");
const ALevelStudent = require("../models/ALevelStudent");
const OLevelStudent = require("../models/OLevelStudent");

const CORE_SUBJECT_KEYS = {
  O_LEVEL: ["M1_R4", "M2_R4", "M3_R4", "M4_R4"],
  A_LEVEL: ["A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8", "A9", "A10"],
};

function computeFinalStatus(course, subjectsObj) {
  const coreKeys = CORE_SUBJECT_KEYS[course];
  const statuses = coreKeys.map((k) => subjectsObj[k]?.latest_status || null);

  if (statuses.some((s) => s === "FAIL")) return "FAIL";
  if (statuses.every((s) => s === "ABSENT")) return "ALL ABSENT";
  if (statuses.every((s) => s === "PASS")) return "PASS";
  return "RESULT PENDING";
}

async function recalculate(course, Model) {
  const students = await Model.find();
  let changed = 0;

  for (const student of students) {
    const newStatus = computeFinalStatus(course, student.subjects);
    if (student.final_status !== newStatus) {
      student.final_status = newStatus;
      await student.save();
      changed += 1;
    }
  }

  console.log(`${course}: ${students.length} students checked, ${changed} updated.`);
}

(async () => {
  await connectDB();
  await recalculate("O_LEVEL", OLevelStudent);
  await recalculate("A_LEVEL", ALevelStudent);
  console.log("Done.");
  process.exit(0);
})().catch((err) => {
  console.error("Recalculation failed:", err);
  process.exit(1);
});