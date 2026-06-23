const ALevelStudent = require("../models/ALevelStudent");
const OLevelStudent = require("../models/OLevelStudent");
const ResultHistory = require("../models/ResultHistory");
const ExamCycle = require("../models/ExamCycle");
const ActivityLog = require("../models/ActivityLog");

function getModel(course) {
  return course === "A_LEVEL" ? ALevelStudent : OLevelStudent;
}

// @desc   List/search students for a course, sorted by regn_no
// @route  GET /api/results/students?course=O_LEVEL&search=&page=&limit=
// @access Protected
const listStudents = async (req, res) => {
  try {
    const { course = "O_LEVEL", search = "", page = 1, limit = 50 } = req.query;
    if (!["O_LEVEL", "A_LEVEL"].includes(course)) {
      return res.status(400).json({ success: false, message: "Invalid course" });
    }
    const Model = getModel(course);

    const filter = {};
    if (search.trim()) {
      const re = new RegExp(search.trim(), "i");
      filter.$or = [{ regn_no: re }, { name: re }, { roll_no: re }, { batch_no: re }];
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

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      limit: limitNum,
      students,
    });
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

module.exports = { listStudents, getStudent, listCycles };