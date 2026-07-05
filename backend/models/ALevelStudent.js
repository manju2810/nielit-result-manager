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

const aLevelStudentSchema = new mongoose.Schema(
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
    mother_name: { type: String, trim: true, default: null },
    dob: { type: String, trim: true, default: null },
    category: { type: String, trim: true, default: null },
    batch_no: { type: String, trim: true, default: null }, // institute batch code, e.g. "DIO-149" (from Exam Registration file)
    enrollment_batch: { type: String, trim: true, default: null }, // enrollment cohort, e.g. "Jan-2023" (from Student Registration file)
    enrollment_app_no: { type: String, trim: true, default: null },
    exam_app_no: { type: String, trim: true, default: null },
    expiry_date: { type: String, trim: true, default: null },
    address: { type: String, trim: true, default: null },
    city: { type: String, trim: true, default: null },
    state: { type: String, trim: true, default: null },
    pincode: { type: String, trim: true, default: null },
    subjects: {
      A1:  { type: subjectSchema, default: () => ({}) },
      A2:  { type: subjectSchema, default: () => ({}) },
      A3:  { type: subjectSchema, default: () => ({}) },
      A4:  { type: subjectSchema, default: () => ({}) },
      A5:  { type: subjectSchema, default: () => ({}) },
      A6:  { type: subjectSchema, default: () => ({}) },
      A7:  { type: subjectSchema, default: () => ({}) },
      A8:  { type: subjectSchema, default: () => ({}) },
      A9:  { type: subjectSchema, default: () => ({}) },
      A10: { type: subjectSchema, default: () => ({}) },
      PR5: { type: subjectSchema, default: () => ({}) },
    },
    final_status: {
      type: String,
      enum: [
        "PASS",
        "FAIL",
        "RESULT PENDING",
        "ALL ABSENT",
        "NO SUBJECTS",
        null,
      ],
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ALevelStudent", aLevelStudentSchema);