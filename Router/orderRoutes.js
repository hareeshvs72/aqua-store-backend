// const express = require("express");
// const router = express.Router();
// const { ClerkExpressRequireAuth } = require("@clerk/clerk-sdk-node");

// const {
//   createOrder,
//   getAllOrders,
//   getMyOrders,
//   getOrderById,
//   updateOrderStatus,
// } = require("../controllers/orderController");

// // User routes
// router.post("/", ClerkExpressRequireAuth(), createOrder);
// router.get("/my", ClerkExpressRequireAuth(), getMyOrders);
// router.get("/:id", ClerkExpressRequireAuth(), getOrderById);

// // Admin routes
// router.get("/", ClerkExpressRequireAuth(), getAllOrders);
// router.put("/:id", ClerkExpressRequireAuth(), updateOrderStatus);

// module.exports = router;


const express = require("express");
const router = express.Router();
const { ClerkExpressRequireAuth } = require("@clerk/clerk-sdk-node");

const {
  createOrder,
  getAllOrders,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
} = require("../controllers/orderController");

// User routes
router.post("/", ClerkExpressRequireAuth(), createOrder);
router.get("/my", ClerkExpressRequireAuth(), getMyOrders);
router.get("/:id", ClerkExpressRequireAuth(), getOrderById);

// Admin routes
router.get("/", ClerkExpressRequireAuth(), getAllOrders);
router.put("/:id", ClerkExpressRequireAuth(), updateOrderStatus);

module.exports = router;



// =========================
router.post("/test", (req, res) => {
  console.log("✅ Test route reached");
  res.json({ success: true });
});

module.exports = router;