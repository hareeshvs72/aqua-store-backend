const Order = require("../models/Order");
const Product = require("../models/productModel");
const stripe = require("../config/stripe");
const PendingOrder = require("../models/PendingOrder");
require("dotenv").config();

// --------------------------------------------------
// 🔹 CREATE ORDER
// --------------------------------------------------
const createOrder = async (req, res) => {
  try {
    console.log("🔹 Incoming Order Payload:", req.body);

    const clerkId = req.auth.userId;
    const { items, shippingAddress } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No order items",
      });
    }

    let subtotal = 0;
    const lineItems = [];

    // Validate products
    for (const item of items) {
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

      item.price = product.price;
      subtotal += product.price * item.quantity;

      lineItems.push({
        price_data: {
          currency: "inr",
          product_data: {
            name: product.name,
            images:
              product.images?.length > 0
                ? [product.images[0]]
                : [
                    "https://images.unsplash.com/photo-1610832958506-aa56368176cf",
                  ],
          },
          unit_amount: Math.round(product.price * 100),
        },
        quantity: item.quantity,
      });
    }

    const shipping = subtotal > 2000 ? 0 : 150;
    const tax = 120;
    const totalAmount = subtotal + shipping + tax;

    if (shipping > 0) {
      lineItems.push({
        price_data: {
          currency: "inr",
          product_data: {
            name: "Shipping Charge",
          },
          unit_amount: shipping * 100,
        },
        quantity: 1,
      });
    }

    if (tax > 0) {
      lineItems.push({
        price_data: {
          currency: "inr",
          product_data: {
            name: "Tax",
          },
          unit_amount: tax * 100,
        },
        quantity: 1,
      });
    }

    // Create Pending Order
    const pendingOrder = await PendingOrder.create({
      clerkId,
      items,
      shippingAddress,
      subtotal,
      shipping,
      tax,
      totalAmount,
    });

    const frontendUrl =
      process.env.FRONTEND_URL || "http://localhost:5173";

    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: lineItems,

        success_url: `${frontendUrl}/orders?payment=success&session_id={CHECKOUT_SESSION_ID}`,

        cancel_url: `${frontendUrl}/cart?payment=cancel`,

        metadata: {
          pendingOrderId: pendingOrder._id.toString(),
        },
      });

      return res.status(201).json({
        success: true,
        message: "Checkout session created successfully",
        url: session.url,
      });
    } catch (stripeError) {
      // Remove Pending Order if Stripe session creation fails
      await PendingOrder.findByIdAndDelete(pendingOrder._id);

      throw stripeError;
    }
  } catch (error) {
    console.error("Create Order Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// --------------------------------------------------
// 🔹 GET ALL ORDERS (Admin)
// --------------------------------------------------
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
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
  getAllOrders,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
};
