const express = require("express");
const dotenv = require("dotenv");
const { clerkMiddleware } = require("@clerk/express");

dotenv.config();
const cors = require("cors");

const connectDB = require("./Database/dbConnection");
const userRoutes = require("./Router/userRoutes");
const productRoutes = require("./Router/productRoutes");
const orderRoutes = require("./Router/orderRoutes");
const CartRoutes = require("./Router/CartRoutes");

connectDB();



const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// clockSkewInMs allows up to 60s of clock difference between frontend & backend
// This fixes the "token-not-active-yet" (nbf) JWT rejection
app.use(clerkMiddleware({ clockSkewInMs: 60000 }))

// Routes
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", CartRoutes);

app.use((err, req, res, next) => {
  console.error("🔥 Clerk Error:", err);
  res.status(401).json({ error: err.message });
});

app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server started on port ${PORT}`);
});
