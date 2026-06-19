const Cart = require("../models/cartModel");
const User = require("../models/userModel");

// ADD TO CART
const addToCart = async (req, res) => {
    console.log("Add To CArt Api");
    
  try {
    const clerkId = req.auth.userId; // from Clerk
    const dbUser = await User.findOne({ clerkId });
    if (!dbUser) return res.status(404).json({ message: "User not found in database" });
    const userId = dbUser._id;

    // Normalize product data
    const qtyToAdd = Number(product.quantity) || 1;
    const itemPrice = Number(product.price);

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({
        userId,
        items: [{ ...product, quantity: qtyToAdd }],
        totalPrice: itemPrice * qtyToAdd
      });
    } else {
      const itemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === (product.productId?._id || product.productId)
      );

      if (itemIndex > -1) {
        // Update existing item
        cart.items[itemIndex].quantity += qtyToAdd;
      } else {
        // Add new item
        cart.items.push({ ...product, quantity: qtyToAdd });
      }

      // Recalculate whole cart total for safety
      cart.totalPrice = cart.items.reduce(
        (acc, item) => acc + (Number(item.price) * (Number(item.quantity) || 1)),
        0
      );
    }

    await cart.save();

    res.status(200).json({
      success: true,
      message: "Cart updated successfully",
      cart
    });

  } catch (err) {
    console.log(err);
    
    res.status(500).json({ message: err.message });
  }
};

// GET CART
const getCart = async (req, res) => {
  try {
    const clerkId = req.auth.userId;
    const dbUser = await User.findOne({ clerkId });
    if (!dbUser) return res.status(404).json({ message: "User not found in database" });
    const userId = dbUser._id;

    const cart = await Cart.findOne({ userId }).populate("items.productId");

    res.status(200).json({
      success: true,
      cart
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// REMOVE ITEM
const removeFromCart = async (req, res) => {
  try {
    const clerkId = req.auth.userId;
    const dbUser = await User.findOne({ clerkId });
    if (!dbUser) return res.status(404).json({ message: "User not found in database" });
    const userId = dbUser._id;

    const { productId } = req.body;

    const cart = await Cart.findOne({ userId });

    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId
    );

    cart.totalPrice = cart.items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    await cart.save();

    res.status(200).json({
      success: true,
      message: "Item removed",
      cart
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// UPDATE QUANTITY
const updateQuantity = async (req, res) => {
  try {
    const clerkId = req.auth.userId;
    const dbUser = await User.findOne({ clerkId });
    if (!dbUser) return res.status(404).json({ message: "User not found in database" });
    const userId = dbUser._id;

    const { productId, quantity } = req.body;

    const cart = await Cart.findOne({ userId });

    const item = cart.items.find(
      (item) => item.productId.toString() === productId
    );

    if (item) {
      item.quantity = quantity;
    }

    cart.totalPrice = cart.items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    await cart.save();

    res.status(200).json({
      success: true,
      message: "Quantity updated",
      cart
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  addToCart,
  getCart,
  removeFromCart,
  updateQuantity
};