const express = require("express");
const {
  addToCart,
  getCart,
  removeFromCart,
  updateQuantity
} = require("../controllers/cartController");
const { ClerkExpressRequireAuth, requireAuth } = require("@clerk/clerk-sdk-node");

const authMiddleware = ClerkExpressRequireAuth({
  onError: (err, req, res, next) => {
    console.error("Cart Clerk Auth Error on", req.url, ":", err.message);
    res.status(401).json({ success: false, message: "Unauthenticated", details: err.message });
  }
});

const router = express.Router();

router.post("/add", addToCart);
router.get("/", getCart);
router.delete("/remove", removeFromCart);
router.put("/update", updateQuantity);



module.exports = router;