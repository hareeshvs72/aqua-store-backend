const User = require("../models/userModel");

// Middleware to verify Clerk session and return clean JSON 401 on failure
const requireAuthApi = (req, res, next) => {
  console.log("\n🔒 [requireAuthApi] Checking Clerk Auth session...");
  console.log("Auth header present:", !!req.headers.authorization);
  console.log("req.auth populated:", !!req.auth);
  
  if (!req.auth || !req.auth.userId) {
    console.warn("❌ [requireAuthApi] Session validation failed: No userId in req.auth");
    if (req.auth) {
      console.warn("   Reason:", req.auth.reason);
      console.warn("   Message:", req.auth.message);
    }
    return res.status(401).json({ 
      success: false, 
      message: "Unauthenticated: No active Clerk session found" 
    });
  }
  
  console.log("✅ [requireAuthApi] Session valid, userId:", req.auth.userId);
  next();
};

// Middleware to verify Clerk session and resolve MongoDB user
const requireAuthUser = async (req, res, next) => {
  console.log("\n🔒 [requireAuthUser] Checking Clerk Auth and resolving database user...");
  console.log("Auth header present:", !!req.headers.authorization);
  console.log("req.auth populated:", !!req.auth);

  try {
    if (!req.auth || !req.auth.userId) {
      console.warn("❌ [requireAuthUser] Clerk verification failed: No userId in req.auth");
      console.log("   Full req.auth object:", req.auth);
      return res.status(401).json({ 
        success: false, 
        message: "Unauthenticated: No active Clerk session found" 
      });
    }

    const clerkId = req.auth.userId;
    console.log("🔍 [requireAuthUser] Querying MongoDB user with clerkId:", clerkId);
    
    const dbUser = await User.findOne({ clerkId });
    if (!dbUser) {
      console.warn(`❌ [requireAuthUser] User with clerkId "${clerkId}" not found in MongoDB`);
      return res.status(404).json({ 
        success: false, 
        message: "User not found in database" 
      });
    }

    req.user = dbUser;
    console.log(`✅ [requireAuthUser] User resolved to DB ID: ${dbUser._id} | Name: ${dbUser.name}`);
    next();
  } catch (error) {
    console.error("🔥 [requireAuthUser] Middleware error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  requireAuthApi,
  requireAuthUser
};
