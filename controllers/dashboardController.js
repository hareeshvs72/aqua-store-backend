const Product = require("../models/productModel");
const Order = require("../models/Order");
const User = require("../models/userModel");

const getDashboard = async (req, res) => {
    console.log("inside getDashboard");
    
  try {
    // Products
    const totalFishProducts = await Product.countDocuments({
      category: "Fish",
    });

    const totalAccessories = await Product.countDocuments({
      category: "Accessories",
    });

    // Orders
    const totalOrders = await Order.countDocuments();

    // Revenue
    const revenue = await Order.aggregate([
      {
        $match: {
          paymentStatus: "paid",
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: "$totalAmount",
          },
        },
      },
    ]);

    const totalRevenue =
      revenue.length > 0 ? revenue[0].totalRevenue : 0;

    // Low Stock
    const lowStockProducts = await Product.find({
      stock: { $lte: 5 },
    }).select("name stock");

    // Pending Orders
    const pendingOrders = await Order.countDocuments({
      orderStatus: "Pending",
    });

    // Recent Orders
 const recentOrders = await Order.find()
  .populate("items.product", "name")
  .sort({ createdAt: -1 })
  .limit(5)
  .lean();

const ordersWithUsers = await Promise.all(
  recentOrders.map(async (order) => {
    const user = await User.findOne(
      { clerkId: order.clerkId },
      "name email"
    );

    return {
      ...order,
      user,
    };
  })
);

    // Total Users
    const totalUsers = await User.countDocuments();

    // New Users This Week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const newUsers = await User.countDocuments({
      createdAt: {
        $gte: weekAgo,
      },
    });

    res.status(200).json({
      success: true,

      cards: {
        totalFishProducts,
        totalAccessories,
        totalOrders,
        totalRevenue,
      },

      quickInsights: {
        lowStockProducts,
        pendingOrders,
      },

      users: {
        totalUsers,
        newUsers,
      },

      recentOrders:ordersWithUsers,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const getWeeklyRevenue = async (req, res) => {
  try {
    const data = await Order.aggregate([
      {
        $match: {
          paymentStatus: "paid",
        },
      },
      {
        $group: {
          _id: {
            $dayOfWeek: "$createdAt",
          },
          revenue: {
            $sum: "$totalAmount",
          },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ]);

    res.json(data);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};
const getMonthlyRevenue = async (req, res) => {
    console.log("inside getMonthlyRevenue ");
    
  try {
    const data = await Order.aggregate([
      {
        $match: {
          paymentStatus: "paid",
        },
      },
      {
        $group: {
          _id: {
            $month: "$createdAt",
          },
          revenue: {
            $sum: "$totalAmount",
          },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ]);

    res.json(data);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

module.exports = {
  getDashboard,getMonthlyRevenue,getWeeklyRevenue
};