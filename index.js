const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const orderRoutes = require("./Router/orderRoutes");
const connectDB = require("./Database/dbConnection");
const userRoutes = require("./Router/userRoutes");
const productRoutes = require("./Router/productRoutes");

dotenv.config();
connectDB();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
// Connect Database


app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server started on port ${PORT}`);
});
