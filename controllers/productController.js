const Product = require("../models/productModel");

// ----------------------------------------------------
// 🔹 CREATE PRODUCT (Admin)
// ----------------------------------------------------
const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      waterType,
      difficulty,
      price,
      stock,
      images,
      isFeatured,
    } = req.body;

    if (!name || !description || !category || !price) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing",
      });
    }

    const product = await Product.create({
      name,
      description,
      category,
      waterType,
      difficulty,
      price,
      stock,
      images,
      isFeatured,
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ----------------------------------------------------
// 🔹 GET ALL PRODUCTS (With Filters + Pagination)
// ----------------------------------------------------
const getAllProducts = async (req, res) => {
  try {
    const { category, waterType, difficulty, search, page = 1, limit = 10 } = req.query;

    const query = {};

    if (category) query.category = category;
    if (waterType) query.waterType = waterType;
    if (difficulty) query.difficulty = difficulty;

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    const skip = (page - 1) * limit;

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ----------------------------------------------------
// 🔹 GET SINGLE PRODUCT
// ----------------------------------------------------
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ----------------------------------------------------
// 🔹 UPDATE PRODUCT (Admin)
// ----------------------------------------------------
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ----------------------------------------------------
// 🔹 DELETE PRODUCT (Admin)
// ----------------------------------------------------
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
