const mongoose = require("mongoose");
const dotenv = require("dotenv");
const dns = require("dns");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const User = require("../models/User");

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected...");

    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      console.log("Admin already exists!");
      console.log(`Email: ${existingAdmin.email}`);
      process.exit(0);
    }

    const admin = await User.create({
      name: "Admin",
      email: "admin@nielit.gov.in",
      password: process.env.ADMIN_PASSWORD,
      role: "admin",
      is_active: true,
      created_by: null,
    });

    console.log("✅ Admin created successfully!");
    console.log(`Name     : ${admin.name}`);
    console.log(`Email    : ${admin.email}`);
    console.log(`Password : Admin@123`);
    console.log(`Role     : ${admin.role}`);
    console.log("\n⚠️  Please change password after first login!");

    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
};

seedAdmin();