const Order = require("../models/Order");
const Product = require("../models/productModel");

// --------------------------------------------------
// 🔹 CREATE ORDER
// --------------------------------------------------
const createOrder = async (req, res) => {
  try {
    const clerkId = req.auth.userId;
    const { items, shippingAddress } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No order items",
      });
    }

    let totalAmount = 0;

    // Validate products & calculate total
    for (let item of items) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `${product.name} is out of stock`,
        });
      }

      totalAmount += product.price * item.quantity;

      // Reduce stock
      product.stock -= item.quantity;
      await product.save();

      item.price = product.price;
    }

    const order = await Order.create({
      clerkId,
      items,
      shippingAddress,
      totalAmount,
    });

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: order,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// --------------------------------------------------
// 🔹 GET MY ORDERS
// --------------------------------------------------
const getMyOrders = async (req, res) => {
  try {
    const clerkId = req.auth.userId;

    const orders = await Order.find({ clerkId })
      .populate("items.product")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: orders.length,
      data: orders,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// --------------------------------------------------
// 🔹 GET SINGLE ORDER
// --------------------------------------------------
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("items.product");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// --------------------------------------------------
// 🔹 UPDATE ORDER STATUS (Admin)
// --------------------------------------------------
const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus, paymentStatus } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus, paymentStatus },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order updated",
      data: order,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
};
