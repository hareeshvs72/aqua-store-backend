const express = require("express");
const router = express.Router();
const { ClerkExpressRequireAuth } = require("@clerk/clerk-sdk-node");

const {
  getDashboard,
  getWeeklyRevenue,
  getMonthlyRevenue,
} = require("../controllers/dashboardController");
const isAdmin = require("../middleware/auth");

// Admin Dashboard
router.get("/",isAdmin, getDashboard);

// Revenue Chart
router.get("/weekly-revenue",isAdmin, getWeeklyRevenue);

router.get("/monthly-revenue", isAdmin, getMonthlyRevenue);

module.exports = router;