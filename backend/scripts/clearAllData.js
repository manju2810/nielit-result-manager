const dotenv = require("dotenv");
dotenv.config();

const connectDB = require("../config/db");
const ALevelStudent = require("../models/ALevelStudent");
const OLevelStudent = require("../models/OLevelStudent");
const ResultHistory = require("../models/ResultHistory");
const ExamCycle = require("../models/ExamCycle");
const ActivityLog = require("../models/ActivityLog");

(async () => {
  await connectDB();

  await OLevelStudent.deleteMany({});
  console.log("✓ OLevelStudent cleared");

  await ALevelStudent.deleteMany({});
  console.log("✓ ALevelStudent cleared");

  await ResultHistory.deleteMany({});
  console.log("✓ ResultHistory cleared");

  await ExamCycle.deleteMany({});
  console.log("✓ ExamCycle cleared");

  await ActivityLog.deleteMany({});
  console.log("✓ ActivityLog cleared");

  console.log("\nAll data cleared. Users are kept (admin account safe).");
  process.exit(0);
})().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});