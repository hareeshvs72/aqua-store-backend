const Order = require("../models/Order");
const PendingOrder = require("../models/PendingOrder");
const Product = require("../models/productModel");
const User = require("../models/userModel");
const Cart = require("../models/cartModel");
const stripe = require("../config/stripe");

const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("❌ Webhook Signature Error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const pendingOrderId = session.metadata?.pendingOrderId;

    if (!pendingOrderId) {
      console.log("❌ Pending Order ID not found");
      return res.json({ received: true });
    }

    try {
      // Find Pending Order
      const pendingOrder = await PendingOrder.findById(pendingOrderId);

      if (!pendingOrder) {
        console.log("❌ Pending Order not found");
        return res.json({ received: true });
      }

      // Prevent duplicate orders
      const existingOrder = await Order.findOne({
        paymentIntentId: session.payment_intent,
      });

      if (existingOrder) {
        console.log("⚠️ Order already exists");
        return res.json({ received: true });
      }

      // Update stock
      for (const item of pendingOrder.items) {
        const product = await Product.findById(item.product);

        if (!product) continue;

        product.stock -= item.quantity;

        if (product.stock < 0) {
          product.stock = 0;
        }

        await product.save();
      }

      // Create Final Order
      const order = await Order.create({
        clerkId: pendingOrder.clerkId,
        items: pendingOrder.items,
        shippingAddress: pendingOrder.shippingAddress,
        totalAmount: pendingOrder.totalAmount,

        paymentStatus: "paid",
        orderStatus: "Processing",

        paymentIntentId: session.payment_intent,
      });

      console.log("✅ Order Created:", order._id);

      // Clear Cart
      const user = await User.findOne({
        clerkId: pendingOrder.clerkId,
      });

      if (user) {
        await Cart.findOneAndDelete({
          userId: user._id,
        });

        console.log("✅ Cart Cleared");
      }

      // Delete Pending Order
      await PendingOrder.findByIdAndDelete(pendingOrder._id);

      console.log("✅ Pending Order Deleted");
    } catch (error) {
      console.error("Webhook Error:", error);
    }
  }

  res.status(200).json({
    received: true,
  });
};

module.exports = stripeWebhook;