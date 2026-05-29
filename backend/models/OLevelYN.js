// models/OLevel.js
import mongoose from "mongoose";

const OLevelSchema = new mongoose.Schema(
    {
        monthYear: { type: String, required: true, index: true },
        Roll_No: { type: String },
        Name: { type: String },
        Father_Name: { type: String },
        Regn_No: { type: String, required: true, index: true },
        Examination_Application_No: { type: String },
        Batch_No: { type: String },

        // Module Results
        M1_R4: { type: String, default: "" },
        M2_R4: { type: String, default: "" },
        M3_R4: { type: String, default: "" },
        M4_3_R4: { type: String, default: "" },

        // PROJECT Status (replaced PR)
        Project: { type: String, default: "Not Submitted", enum: ["Not Submitted", "Submitted"] },
        
        fee_paid: { type: String },
        Month_year_Level: { type: String },
        remarks: { type: String, default: "" },
    },
    { timestamps: true }
);

// Compound index for unique monthYear + Regn_No combination
OLevelSchema.index({ monthYear: 1, Regn_No: 1 }, { unique: true });

export default mongoose.model("OLevel", OLevelSchema);