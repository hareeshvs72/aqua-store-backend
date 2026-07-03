const mongoose = require("mongoose");

const pendingOrderSchema = new mongoose.Schema(
  {
    clerkId: {
      type: String,
      required: true,
    },

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],

    shippingAddress: {
      fullName: String,
      phone: String,
      address: String,
      city: String,
      state: String,
      pincode: String,
      country: String,
    },

    subtotal: Number,
    shipping: Number,
    tax: Number,
    totalAmount: Number,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("PendingOrder", pendingOrderSchema);