const express = require("express");
const router = express.Router();
require("dotenv").config();

const {
  syncUser,
  getCurrentUser,
  updateUserProfile,
  getUserAnalytics,
  updateUserRole,
} = require("../controllers/userController");
const { ClerkExpressRequireAuth } = require("@clerk/clerk-sdk-node");

// User routes
router.get("/sync", syncUser);
router.get("/me",  getCurrentUser);
router.put("/update", updateUserProfile);

// Admin routes
router.get("/",getUserAnalytics  );
router.put("/role", updateUserRole);

module.exports = router;
