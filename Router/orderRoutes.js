const express = require("express");
const router = express.Router();
const { ClerkExpressRequireAuth } = require("@clerk/clerk-sdk-node");

const {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
} = require("../controllers/orderController");

// User routes
router.post("/", ClerkExpressRequireAuth(), createOrder);
router.get("/my", ClerkExpressRequireAuth(), getMyOrders);
router.get("/:id", ClerkExpressRequireAuth(), getOrderById);

// Admin route (add admin middleware later)
router.put("/:id", ClerkExpressRequireAuth(), updateOrderStatus);

module.exports = router;
