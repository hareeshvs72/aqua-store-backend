const express = require("express");
const router = express.Router();
require("dotenv").config();

const {
  syncUser,
  getCurrentUser,
  updateUserProfile,
  getAllUsers,
  updateUserRole,
} = require("../controllers/userController");

// User routes
router.get("/sync", syncUser);
router.get("/me",  getCurrentUser);
router.put("/update", updateUserProfile);

// Admin routes
router.get("/",  getAllUsers);
router.put("/role", updateUserRole);

module.exports = router;
