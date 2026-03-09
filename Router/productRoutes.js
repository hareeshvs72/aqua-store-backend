const express = require("express");
const router = express.Router();
const { ClerkExpressRequireAuth } = require("@clerk/clerk-sdk-node");

const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getAllProductsAdmin
} = require("../controllers/productController");
const upload = require("../middleware/multer");
// Public
router.get("/", getAllProducts);
router.get("/:id", getProductById);

// Protected (Add admin middleware later)
router.post("/", ClerkExpressRequireAuth(),upload.array("images"), createProduct);
router.put("/:id", ClerkExpressRequireAuth(), updateProduct);
router.delete("/:id", ClerkExpressRequireAuth(), deleteProduct);
router.get("/admin/products", ClerkExpressRequireAuth(), getAllProductsAdmin);
module.exports = router;
