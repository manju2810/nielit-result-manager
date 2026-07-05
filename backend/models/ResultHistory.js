const mongoose = require("mongoose");

const resultHistorySchema = new mongoose.Schema(
  {
    regn_no: {
      type: String,
      required: [true, "Registration number is required"],
      trim: true,
    },
    course: {
      type: String,
      enum: ["O_LEVEL", "A_LEVEL"],
      required: [true, "Course is required"],
    },
    exam_cycle_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExamCycle",
      required: true,
    },
    cycle_name: {
      type: String,
      required: true,
      trim: true,
    },
    subject_key: {
      type: String,
      required: true,
      trim: true,
    },
    subject_code: {
      type: String,
      required: true,
      trim: true,
    },
    grade: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["PASS", "FAIL", "ABSENT"],
      required: true,
    },
    is_best: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ResultHistory", resultHistorySchema);