const Product = require("../models/productModel");
const cloudinary = require("../config/cloudinary")
require("dotenv").config()
// ----------------------------------------------------
// 🔹 CREATE PRODUCT (Admin)
// ----------------------------------------------------
const createProduct = async (req, res) => {
  console.log("inside Create Product");

  try {

    const imageUrls = [];

    for (const file of req.files) {
  console.log(file.path);
  
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "aqua_store_products"
      });

      imageUrls.push(result.secure_url);
    }

    const product = new Product({
      ...req.body,
      images: imageUrls
    });

    await product.save();

    res.status(201).json(product);

  } catch (error) {
    console.log(error);
    res.status(500).json(error);
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
  console.log("get single product");
  
  try {
    const products = await Product.findById(req.params.id);
  console.log(products);
  
    if (!products) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
     let category = products.category
    const  relatedProducts = await Product.find({category:category}).limit(4)
    console.log(category);
    
    res.status(200).json({
      success: true,
      product: products,
      relatedProduct : relatedProducts
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
  console.log("inside product update ");
  const {id} = req.params
  console.log((id));
  console.log(req.body);
  
  try {
    const product = await Product.findByIdAndUpdate(
     id,
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
    console.log(error);
    
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

// --------------------------------------------
// GET ALL PRODUCTS (ADMIN)
// --------------------------------------------
const getAllProductsAdmin = async (req, res) => {
  try {

    const products = await Product.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: products.length,
      data: products
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};
module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getAllProductsAdmin
};
