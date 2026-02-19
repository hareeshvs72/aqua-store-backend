const express = require("express");
const router = express.Router();
const { ClerkExpressRequireAuth } = require("@clerk/clerk-sdk-node");

const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

// Public
router.get("/", getAllProducts);
router.get("/:id", getProductById);

// Protected (Add admin middleware later)
router.post("/", ClerkExpressRequireAuth(), createProduct);
router.put("/:id", ClerkExpressRequireAuth(), updateProduct);
router.delete("/:id", ClerkExpressRequireAuth(), deleteProduct);

module.exports = router;
