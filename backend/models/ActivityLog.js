const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    user_name: {
      type: String,
      required: true,
    },
    user_email: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      required: true,
    },
    action: {
      type: String,
      enum: [
        "UPLOAD",
        "DOWNLOAD",
        "VIEW",
        "DELETE",
        "LOGIN",
        "LOGOUT",
        "CREATE_USER",
        "DELETE_USER",
      ],
      required: true,
    },
    course: {
      type: String,
      enum: ["O_LEVEL", "A_LEVEL", null],
      default: null,
    },
    cycle_name: {
      type: String,
      default: null,
    },
    details: {
      type: String,
      required: true,
    },
    ip_address: {
      type: String,
      default: null,
    },
    performed_at: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ActivityLog", activityLogSchema);