const express = require("express");
const router = express.Router();
const { ClerkExpressRequireAuth } = require("@clerk/clerk-sdk-node");

const {
  syncUser,
  getCurrentUser,
  updateUserProfile,
  getAllUsers,
  updateUserRole,
} = require("../controllers/userController");

// User routes
router.get("/sync", ClerkExpressRequireAuth(), syncUser);
router.get("/me", ClerkExpressRequireAuth(), getCurrentUser);
router.put("/update", ClerkExpressRequireAuth(), updateUserProfile);

// Admin routes (add admin middleware later)
router.get("/", ClerkExpressRequireAuth(), getAllUsers);
router.put("/role", ClerkExpressRequireAuth(), updateUserRole);

module.exports = router;
