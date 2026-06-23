const User = require("../models/User");
const ActivityLog = require("../models/ActivityLog");

// @desc   List all users
// @route  GET /api/users
// @access Protected (admin)
const listUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Create a new staff user
// @route  POST /api/users
// @access Protected (admin)
const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email and password are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }
    if (role && !["admin", "user"].includes(role)) {
      return res.status(400).json({ success: false, message: "Role must be 'admin' or 'user'" });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ success: false, message: "A user with this email already exists" });
    }

    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: role || "user",
      created_by: req.user._id,
    });

    await ActivityLog.create({
      user_id: req.user._id,
      user_name: req.user.name,
      user_email: req.user.email,
      role: req.user.role,
      action: "CREATE_USER",
      details: `Created ${newUser.role} account for ${newUser.email}`,
      ip_address: req.ip,
    });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: { _id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role, is_active: newUser.is_active },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Activate/deactivate a user
// @route  PATCH /api/users/:id/status
// @access Protected (admin)
const setUserStatus = async (req, res) => {
  try {
    const { is_active } = req.body;
    if (typeof is_active !== "boolean") {
      return res.status(400).json({ success: false, message: "is_active must be true or false" });
    }
    if (req.params.id === String(req.user._id)) {
      return res.status(400).json({ success: false, message: "You cannot deactivate your own account" });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.is_active = is_active;
    await user.save();

    await ActivityLog.create({
      user_id: req.user._id,
      user_name: req.user.name,
      user_email: req.user.email,
      role: req.user.role,
      action: is_active ? "ACTIVATE_USER" : "DEACTIVATE_USER",
      details: `${is_active ? "Activated" : "Deactivated"} account for ${user.email}`,
      ip_address: req.ip,
    });

    res.status(200).json({ success: true, message: "User status updated" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { listUsers, createUser, setUserStatus };