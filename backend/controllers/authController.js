const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ActivityLog = require("../models/ActivityLog");

// Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check email and password provided
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check if account is active
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: "Your account has been deactivated. Contact admin.",
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate token
    const token = generateToken(user._id, user.role);

    // Log activity
    await ActivityLog.create({
      user_id: user._id,
      user_name: user.name,
      user_email: user.email,
      role: user.role,
      action: "LOGIN",
      details: "User logged in successfully",
      ip_address: req.ip,
      performed_at: new Date(),
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Protected
const logout = async (req, res) => {
  try {
    // Log activity
    await ActivityLog.create({
      user_id: req.user._id,
      user_name: req.user.name,
      user_email: req.user.email,
      role: req.user.role,
      action: "LOGOUT",
      details: "User logged out successfully",
      ip_address: req.ip,
      performed_at: new Date(),
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { login, logout };