const User = require("../models/userModel");
const { getAuth } = require("@clerk/express");

const isAdmin = async (req, res, next) => {
  try {
      const auth = getAuth(req);
        // console.log(auth);
        const {userId} = auth

    const user = await User.findOne({ clerkId :userId});
// console.log(user);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = isAdmin;