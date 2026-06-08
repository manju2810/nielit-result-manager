const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema({
  registered: { type: Boolean, default: false },
  latest_grade: { type: String, default: null },
  latest_status: {
    type: String,
    enum: ["PASS", "FAIL", "ABSENT", "RESULT PENDING", "NOT REGISTERED", null],
    default: null,
  },
  latest_subject_code: { type: String, default: null },
});

const oLevelStudentSchema = new mongoose.Schema(
  {
    regn_no: {
      type: String,
      required: [true, "Registration number is required"],
      unique: true,
      trim: true,
    },
    roll_no: { type: String, trim: true, default: null },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    father_name: { type: String, trim: true, default: null },
    batch_no: { type: String, trim: true, default: null },
    exam_app_no: { type: String, trim: true, default: null },
    subjects: {
      M1_R4:   { type: subjectSchema, default: () => ({}) },
      M2_R4:   { type: subjectSchema, default: () => ({}) },
      M3_R4:   { type: subjectSchema, default: () => ({}) },
      M4_3_R4: { type: subjectSchema, default: () => ({}) },
      Project: { type: subjectSchema, default: () => ({}) },
    },
    final_status: {
      type: String,
      enum: ["PASS", "FAIL", "RESULT PENDING", "ALL ABSENT", "NO SUBJECTS", null],
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("OLevelStudent", oLevelStudentSchema);