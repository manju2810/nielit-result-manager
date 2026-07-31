const mongoose = require("mongoose");

const registrationBatchSchema = new mongoose.Schema(
  {
    batch_name: { type: String, required: true },
    course: { type: String, enum: ["O_LEVEL", "A_LEVEL"], required: true },
    uploaded_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    created_regn_nos: [{ type: String }],
    updated_regn_nos: [{ type: String }],
    status: { type: String, enum: ["active", "reverted"], default: "active" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("RegistrationBatch", registrationBatchSchema);
