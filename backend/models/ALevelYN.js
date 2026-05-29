import mongoose from "mongoose";

const ALevelSchema = new mongoose.Schema(
    {
        monthYear: { type: String },
        Roll_No: String,
        Name: String,
        Father_Name: String,
        Regn_No: String,
        Examination_Application_No: String,
        Batch_No: String,

        A1: String,
        A2: String,
        A3: String,
        A4: String,
        A5: String,
        A6: String,
        A7: String,
        A8: String,
        A9: String,
        A10: String,
        PR5: String, // ✅ PR5 is a subject like A1-A10

        fee_paid: String,
        Month_year_Level: String,
        remarks: { type: String, default: "" }
    },
    { timestamps: true }
);

export default mongoose.model("ALevel", ALevelSchema);