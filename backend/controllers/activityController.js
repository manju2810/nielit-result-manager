const ActivityLog = require("../models/ActivityLog");

// @desc   List activity logs (admin only), most recent first
// @route  GET /api/activity?page=&limit=&action=&user_email=
// @access Protected (admin)
const listActivity = async (req, res) => {
  try {
    const { page = 1, limit = 50, action, user_email } = req.query;
    const filter = {};
    if (action) filter.action = action;
    if (user_email) filter.user_email = new RegExp(user_email, "i");

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 200);

    const [logs, total] = await Promise.all([
      ActivityLog.find(filter)
        .sort({ performed_at: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      ActivityLog.countDocuments(filter),
    ]);

    res.status(200).json({ success: true, total, page: pageNum, limit: limitNum, logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { listActivity };