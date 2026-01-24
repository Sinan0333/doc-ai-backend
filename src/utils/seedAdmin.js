require("dotenv").config();
const connectDB = require("../config/db");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

const seedAdmin = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    const email = process.env.SEED_ADMIN_EMAIL || "admin@docai.com";
    const exists = await User.findOne({ email });
    
    if (exists) {
      console.log("Admin already exists:", email);
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(
      process.env.SEED_ADMIN_PASSWORD || "AdminPass123",
      salt
    );

    const admin = await User.create({
      fullName: process.env.SEED_ADMIN_NAME || "System Admin",
      email,
      password: hashed,
      role: "admin",
      phone: "+1000000000",
      gender: "other"
    });

    console.log("Seeded admin:", admin.email);
    process.exit(0);
  } catch (err) {
    console.error("Error seeding admin:", err);
    process.exit(1);
  }
};

seedAdmin();
