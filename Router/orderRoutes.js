


const express = require("express");
const router = express.Router();
const { ClerkExpressRequireAuth } = require("@clerk/clerk-sdk-node");
const isAdmin = require("../middleware/auth");

const {
  createOrder,
  getAllOrders,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  verifyPayment,
} = require("../controllers/orderController");

// User routes
router.post("/", ClerkExpressRequireAuth(), createOrder);
router.get("/my", ClerkExpressRequireAuth(), getMyOrders);
router.get("/:id", ClerkExpressRequireAuth(), getOrderById);

// Admin routes
router.get("/",isAdmin,getAllOrders);
router.put("/:id", isAdmin, updateOrderStatus);
// router.put("/verify/:sessionId", ClerkExpressRequireAuth(), verifyPayment);


module.exports = router;



// // =========================
// router.post("/test", (req, res) => {
//   console.log("✅ Test route reached");
//   res.json({ success: true });
// });

module.exports = router;