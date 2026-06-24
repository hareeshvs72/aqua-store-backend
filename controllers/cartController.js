const Cart = require("../models/cartModel");
const User = require("../models/userModel");
const { getAuth } = require("@clerk/express");


// ADD TO CART

const addToCart = async (req, res) => {
  console.log("Add To Cart API");

  try {
    // ✅ 1. Get Clerk user
    const auth = getAuth(req);
    // console.log(auth);
    const {userId} = auth
    console.log("clerkId:", userId);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // ✅ 2. Get product from body
    const { product } = req.body;

    if (!product) {
      return res.status(400).json({ message: "Product data missing" });
    }

    // ✅ 3. Find user in DB
    const dbUser = await User.findOne({ clerkId:userId });

    if (!dbUser) {
      return res.status(404).json({ message: "User not found in database" });
    }

    const mongoUserId = dbUser._id; // ✅ renamed

    // ✅ 4. Normalize data
    const qtyToAdd = Number(product.quantity) || 1;
    const itemPrice = Number(product.price);

    let cart = await Cart.findOne({ userId: mongoUserId });

    if (!cart) {
      cart = new Cart({
        userId: mongoUserId,
        items: [{ ...product, quantity: qtyToAdd }],
        totalPrice: itemPrice * qtyToAdd
      });
    } else {
      const itemIndex = cart.items.findIndex(
        (item) =>
          item.productId.toString() ===
          (product.productId?._id || product.productId)
      );

      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += qtyToAdd;
      } else {
        cart.items.push({ ...product, quantity: qtyToAdd });
      }

      cart.totalPrice = cart.items.reduce(
        (acc, item) =>
          acc + Number(item.price) * (Number(item.quantity) || 1),
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
  console.log("getCart");
  
  try {
    
      const auth = getAuth(req);
    // console.log(auth);
    const {userId} = auth
    // console.log("clerkId:", userId);
    const clerkId = req.auth.userId;
    const dbUser = await User.findOne({ clerkId:userId });
    if (!dbUser) return res.status(404).json({ message: "User not found in database" });
    const mongodbId = dbUser._id;

    const cart = await Cart.findOne({ userId:mongodbId }).populate("items.productId");

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
    console.log("removeFromCart");
    
      const auth = getAuth(req);
    // console.log(auth);
    const {userId} = auth
    // console.log("clerkId:", userId);
    const clerkId = req.auth.userId;
    const dbUser = await User.findOne({ clerkId:userId });
    if (!dbUser) return res.status(404).json({ message: "User not found in database" });
    const mongodbId = dbUser._id;

    const { productId } = req.body;

    const cart = await Cart.findOne({ userId:mongodbId });

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
  console.log("updateQuantity");
  
  try {
      const auth = getAuth(req);
    // console.log(auth);
    const {userId} = auth
    // console.log("clerkId:", userId);
    const clerkId = req.auth.userId;
    const dbUser = await User.findOne({ clerkId:userId });
    if (!dbUser) return res.status(404).json({ message: "User not found in database" });
    const mongodbId = dbUser._id;

    const { productId, quantity } = req.body;

    const cart = await Cart.findOne({ userId:mongodbId });

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