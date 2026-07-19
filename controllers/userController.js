const { clerkClient } = require("@clerk/clerk-sdk-node");
const User = require("../models/userModel");
const { getAuth } = require("@clerk/express");
// --------------------------------------------------
// 🔹 CREATE USER IF NOT EXISTS (Auto Sync)
// --------------------------------------------------
const syncUser = async (req, res) => {
  const auth = getAuth(req);
  const { userId } = auth;

  // 🔍 Log full token verification data
  console.log("\n========== 🔐 TOKEN VERIFICATION ==========");
  console.log("Auth Status:", auth.sessionStatus || "N/A");
  console.log("User ID:", userId);
  console.log("Session ID:", auth.sessionId);
  console.log("Is Authenticated:", auth.isAuthenticated);
  console.log("Org ID:", auth.orgId || "none");
  console.log("Token Type:", auth.tokenType);
  if (auth.reason) console.log("Rejection Reason:", auth.reason);
  if (auth.message) console.log("Rejection Message:", auth.message);
  console.log("=============================================\n");

  if (!userId) {
    console.warn("⚠️ Sync failed — no userId. Reason:", auth.reason || "unknown");
    return res.status(401).json({
      success: false,
      message: "Unauthenticated: Clerk could not verify this session.",
      debug: {
        reason: auth.reason,
        message: auth.message,
      },
    });
  }

  try {
    console.log("🔄 Syncing user to MongoDB:", userId);

    // Fetch details from Clerk
    const clerkUser = await clerkClient.users.getUser(userId);

    const email = clerkUser.emailAddresses[0]?.emailAddress || "";
    const name = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim();
    const image = clerkUser.imageUrl || "";

    const user = await User.findOneAndUpdate(
      { clerkId: userId },
      { email, name, image },
      { returnDocument: "after", upsert: true }
    );

    console.log("✅ User synced:", user._id, "| Role:", user.role);

    return res.status(200).json({
      success: true,
      data: user,
    });

  } catch (error) {
    console.error("❌ Sync Error:", error.message);
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
      { returnDocument: 'after', runValidators: true }
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
// 🔹 GET USER ANALYTICS (Admin Only)
// --------------------------------------------------
const getUserAnalytics = async (req, res) => {
   console.log("inside get user analystics");
   
  try {
    const auth = getAuth(req);
    // console.log(auth);
    const {userId} = auth

    const clerkId = userId
  console.log(clerkId , "clerk");
  
    // Verify admin
const admin = await User.find({
  clerkId: { $ne: clerkId },
});    
 console.log("admin" , admin);
 
    if (!admin) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Admins only",
      });
    }

    // Start of current week (Monday)
    const today = new Date();
    const day = today.getDay();
    const diff = day === 0 ? 6 : day - 1;

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - diff);
    startOfWeek.setHours(0, 0, 0, 0);

    // Total users (excluding logged-in admin)
    const totalUsers = await User.countDocuments({
      clerkId: { $ne: clerkId },
    });

    // New registrations this week
    const newRegistrations = await User.countDocuments({
      clerkId: { $ne: clerkId },
      createdAt: { $gte: startOfWeek },
    });

    // Active users this week
    const activeUsers = await User.countDocuments({
      clerkId: { $ne: clerkId },
      lastActive: { $gte: startOfWeek },
    });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        newRegistrations,
        activeUsers,
        users:admin
      },
    });
  } catch (error) {
    res.status(500).json({
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
    const clerkId = req.auth.userId;
    const requestUser = await User.findOne({ clerkId });
    if (!requestUser || requestUser.role !== 'admin') {
      return res.status(403).json({ success: false, message: "Forbidden: Admins only" });
    }

    const { userId, role } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { returnDocument: 'after' }
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
  getUserAnalytics,
  updateUserRole,
};
