const ALevelStudent = require("../models/ALevelStudent");
const OLevelStudent = require("../models/OLevelStudent");
const ResultHistory = require("../models/ResultHistory");
const ExamCycle = require("../models/ExamCycle");
const ActivityLog = require("../models/ActivityLog");
const ExcelJS = require("exceljs");

function getModel(course) {
  return course === "A_LEVEL" ? ALevelStudent : OLevelStudent;
}

// @desc   List/search students for a course, sorted by regn_no, optionally filtered by batch
// @route  GET /api/results/students?course=O_LEVEL&search=&batch=&page=&limit=
// @access Protected
const listStudents = async (req, res) => {
  try {
    const { course = "O_LEVEL", search = "", batch = "", page = 1, limit = 50 } = req.query;
    if (!["O_LEVEL", "A_LEVEL"].includes(course)) {
      return res.status(400).json({ success: false, message: "Invalid course" });
    }
    const Model = getModel(course);

    const filter = {};
    if (search.trim()) {
      const re = new RegExp(search.trim(), "i");
      filter.$or = [{ regn_no: re }, { name: re }, { roll_no: re }, { batch_no: re }];
    }
    if (batch.trim()) {
      filter.$and = [
        ...(filter.$and || []),
        { $or: [{ batch_no: batch.trim() }, { enrollment_batch: batch.trim() }] },
      ];
    }

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 200);

    const [students, total] = await Promise.all([
      Model.find(filter)
        .sort({ regn_no: 1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Model.countDocuments(filter),
    ]);

    res.status(200).json({ success: true, total, page: pageNum, limit: limitNum, students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   List distinct batches for a course
// @route  GET /api/results/batches?course=O_LEVEL
// @access Protected
const listBatches = async (req, res) => {
  try {
    const { course = "O_LEVEL" } = req.query;
    if (!["O_LEVEL", "A_LEVEL"].includes(course)) {
      return res.status(400).json({ success: false, message: "Invalid course" });
    }
    const Model = getModel(course);

    const [batchNos, enrollmentBatches] = await Promise.all([
      Model.distinct("batch_no"),
      Model.distinct("enrollment_batch"),
    ]);

    const batches = [...new Set([...batchNos, ...enrollmentBatches].filter(Boolean))].sort();
    res.status(200).json({ success: true, batches });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get one student's full record + result history
// @route  GET /api/results/students/:regn_no?course=O_LEVEL
// @access Protected
const getStudent = async (req, res) => {
  try {
    const { regn_no } = req.params;
    const { course = "O_LEVEL" } = req.query;
    if (!["O_LEVEL", "A_LEVEL"].includes(course)) {
      return res.status(400).json({ success: false, message: "Invalid course" });
    }
    const Model = getModel(course);

    const student = await Model.findOne({ regn_no });
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    const history = await ResultHistory.find({ regn_no, course }).sort({ createdAt: -1 });

    await ActivityLog.create({
      user_id: req.user._id,
      user_name: req.user.name,
      user_email: req.user.email,
      role: req.user.role,
      action: "VIEW",
      course,
      details: `Viewed result for regn_no ${regn_no}`,
      ip_address: req.ip,
    });

    res.status(200).json({ success: true, student, history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Export students to Excel
// @route  GET /api/results/export?course=O_LEVEL&batch=&search=
// @access Protected
const exportStudents = async (req, res) => {
  try {
    const { course = "O_LEVEL", search = "", batch = "" } = req.query;
    if (!["O_LEVEL", "A_LEVEL"].includes(course)) {
      return res.status(400).json({ success: false, message: "Invalid course" });
    }
    const Model = getModel(course);

    const filter = {};
    if (search.trim()) {
      const re = new RegExp(search.trim(), "i");
      filter.$or = [{ regn_no: re }, { name: re }, { roll_no: re }, { batch_no: re }];
    }
    if (batch.trim()) {
      filter.$and = [
        ...(filter.$and || []),
        { $or: [{ batch_no: batch.trim() }, { enrollment_batch: batch.trim() }] },
      ];
    }

    const students = await Model.find(filter).sort({ regn_no: 1 });

    const isOLevel = course === "O_LEVEL";
    const subjectKeys = isOLevel
      ? ["M1_R4", "M2_R4", "M3_R4", "M4_R4", "Project"]
      : ["A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8", "A9", "A10", "PR5"];

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(`${course} Master Data`);

    // Headers — only essential columns
    sheet.addRow([
      "Regn No",
      "Name",
      "Father Name",
      "Batch",
      ...subjectKeys,
      "Final Status",
    ]);

    // Style header row — navy background, white bold text
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0F2A43" },
    };
    headerRow.alignment = { horizontal: "center" };

    // Data rows
    for (const s of students) {
      const row = [
        s.regn_no,
        s.name,
        s.father_name || "",
        s.batch_no || s.enrollment_batch || "",
        ...subjectKeys.map((k) => {
          const subj = s.subjects?.[k];
          if (!subj || !subj.registered) return "Not Registered";
          return subj.latest_grade || "Pending";
        }),
        s.final_status || "",
      ];
      sheet.addRow(row);
    }

    // Color code Final Status column
    const statusColIndex = 5 + subjectKeys.length;
    sheet.getColumn(statusColIndex).eachCell({ includeEmpty: false }, (cell, rowNumber) => {
      if (rowNumber === 1) return;
      const val = cell.value;
      if (val === "PASS") {
        cell.font = { bold: true, color: { argb: "FF15803D" } };
      } else if (val === "FAIL") {
        cell.font = { bold: true, color: { argb: "FFB91C1C" } };
      } else {
        cell.font = { color: { argb: "FF475569" } };
      }
    });

    // Auto width
    sheet.columns.forEach((col) => {
      let maxLen = 10;
      col.eachCell({ includeEmpty: true }, (cell) => {
        const len = cell.value ? String(cell.value).length : 0;
        if (len > maxLen) maxLen = len;
      });
      col.width = Math.min(maxLen + 2, 30);
    });

    await ActivityLog.create({
      user_id: req.user._id,
      user_name: req.user.name,
      user_email: req.user.email,
      role: req.user.role,
      action: "DOWNLOAD",
      course,
      details: `Exported ${students.length} students to Excel (batch: ${batch || "all"}, search: ${search || "none"})`,
      ip_address: req.ip,
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${course}_master_data_${Date.now()}.xlsx"`
    );
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   List exam cycles uploaded so far
// @route  GET /api/results/cycles?course=
// @access Protected
const listCycles = async (req, res) => {
  try {
    const { course } = req.query;
    const filter = course ? { course } : {};
    const cycles = await ExamCycle.find(filter)
      .sort({ createdAt: -1 })
      .populate("uploaded_by", "name email");
    res.status(200).json({ success: true, cycles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { listStudents, listBatches, getStudent, exportStudents, listCycles };