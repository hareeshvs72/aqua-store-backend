const User = require("../models/userModel");

// --------------------------------------------------
// 🔹 CREATE USER IF NOT EXISTS (Auto Sync)
// --------------------------------------------------
const syncUser = async (req, res) => {
  try {
    const clerkId = req.auth.userId;

    let user = await User.findOne({ clerkId });

    if (!user) {
      user = await User.create({ clerkId });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// --------------------------------------------------
// 🔹 GET CURRENT USER PROFILE
// --------------------------------------------------
const getCurrentUser = async (req, res) => {
  try {
    const clerkId = req.auth.userId;

    const user = await User.findOne({ clerkId });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// --------------------------------------------------
// 🔹 UPDATE USER PROFILE
// --------------------------------------------------
const updateUserProfile = async (req, res) => {
  try {
    const clerkId = req.auth.userId;
    const { address, phone } = req.body;

    const user = await User.findOneAndUpdate(
      { clerkId },
      { address, phone },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// --------------------------------------------------
// 🔹 GET ALL USERS (Admin Only)
// --------------------------------------------------
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      total: users.length,
      data: users,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// --------------------------------------------------
// 🔹 UPDATE USER ROLE (Admin Only)
// --------------------------------------------------
const updateUserRole = async (req, res) => {
  try {
    const { userId, role } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "User role updated",
      data: user,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  syncUser,
  getCurrentUser,
  updateUserProfile,
  getAllUsers,
  updateUserRole,
};
