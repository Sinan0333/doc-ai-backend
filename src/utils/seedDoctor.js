require("dotenv").config();
const connectDB = require("../config/db");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

const seed = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    const email = process.env.SEED_DOCTOR_EMAIL;
    const exists = await User.findOne({ email });
    if (exists) {
      console.log("Doctor already exists:", email);
      process.exit(0);
    }
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(
      process.env.SEED_DOCTOR_PASSWORD || "DoctorPass123",
      salt
    );

    const doctor = await User.create({
      fullName: process.env.SEED_DOCTOR_NAME || "Seed Doctor",
      email,
      password: hashed,
      role: "doctor",
      phone:"+1234567890",
      gender: "male"
    });

    console.log("Seeded doctor:", doctor.email);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seed();
