const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      enum: ["Fish", "Plants", "Accessories"],
      required: true,
    },

    waterType: {
      type: String,
      enum: ["Freshwater", "Saltwater", "Exotic"],
    },

    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Expert"],
    },

    price: {
      type: Number,
      required: true,
    },

    stock: {
      type: Number,
      required: true,
      default: 0,
    },

    images: [
      {
        type: String, // image URLs
      },
    ],

    isFeatured: {
      type: Boolean,
      default: false,
    },

    rating: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
