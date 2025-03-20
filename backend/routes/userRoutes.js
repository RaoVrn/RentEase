import express from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

const router = express.Router();

// ✅ Middleware: Authenticate JWT Token
const authenticateToken = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("❌ JWT Authentication Error:", error);
    res.status(403).json({ message: "Invalid or expired token" });
  }
};

// ✅ User Registration
router.post("/register", async (req, res) => {
  let { name, email, password, role, phone } = req.body;

  console.log("📌 Received Registration Data:", req.body);

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, Email, and Password are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("❌ User already exists!");
      return res.status(400).json({ message: "User already exists" });
    }

    console.log("📌 Hashing Password...");
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("📌 Hashed Password Before Saving:", hashedPassword);

    const newUser = new User({ name, email, password: hashedPassword, role, phone });
    await newUser.save();

    console.log("✅ User Registered Successfully:", newUser);
    res.status(201).json({ message: "User registered successfully", user: { id: newUser._id, name, email, role, phone } });
  } catch (error) {
    console.error("❌ Registration Error:", error);
    res.status(500).json({ message: "Error registering user" });
  }
});




// ✅ User Login
router.post("/login", async (req, res) => {
  const { email, password, role } = req.body;
  console.log("📌 Received Login Data:", req.body);

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log("❌ User not found!");
      return res.status(400).json({ message: "User not found" });
    }

    console.log("📌 Checking Role...");
    console.log("📌 Stored Role:", user.role);
    console.log("📌 Requested Role:", role);

    if (user.role.trim().toLowerCase() !== role.trim().toLowerCase()) {
      console.log("❌ Role mismatch!");
      return res.status(400).json({ message: "Invalid role selected" });
    }

    console.log("📌 Checking Password...");
    console.log("📌 Entered Password:", password);
    console.log("📌 Hashed Password from DB:", user.password);

    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log("📌 Password Match:", isPasswordValid);

    if (!isPasswordValid) {
      console.log("❌ Incorrect Password!");
      return res.status(400).json({ message: "Invalid credentials" });
    }

    console.log("🚀 JWT Secret:", process.env.JWT_SECRET);  // add this log
    const token = jwt.sign(
      { id: user._id.toString(), role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    console.log("✅ Login Successful!");
    res.status(200).json({
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone },
    });
  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({ message: "Error logging in" });
  }
});

// ✅ Get User Profile (Requires Authentication)
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password"); // Exclude password
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    console.error("❌ Profile Fetch Error:", error);
    res.status(500).json({ message: "Error fetching user profile" });
  }
});

// ✅ Get All Users (Only for Landlords)
router.get("/all", authenticateToken, async (req, res) => {
  try {
    // Allow only landlords to access all users
    if (req.user.role !== "landlord") {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    const users = await User.find().select("-password"); // Exclude passwords for security
    res.json(users);
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    res.status(500).json({ message: "Error fetching users" });
  }
});

export default router;
