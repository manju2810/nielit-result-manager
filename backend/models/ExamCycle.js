const mongoose = require("mongoose");

const examCycleSchema = new mongoose.Schema(
  {
    cycle_name: {
      type: String,
      required: [true, "Cycle name is required"],
      trim: true,
    },
    course: {
      type: String,
      enum: ["O_LEVEL", "A_LEVEL"],
      required: [true, "Course is required"],
    },
    month_year: {
      type: String,
      trim: true,
      default: null,
    },
    uploaded_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["processed", "pending"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ExamCycle", examCycleSchema);