require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/userModel")
const email = "hareeshvs72@gmail.com"
async function makeAdmin() {
  await mongoose.connect(process.env.MONGO_URI);

  const user = await User.findOneAndUpdate(
    { email },
    { role: "admin" },
    { new: true }
  );

  console.log(user);
  process.exit();
}

makeAdmin();

