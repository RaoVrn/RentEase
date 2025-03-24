import express from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config(); 

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

// ✅ Middleware: Restrict to Tenants Only
const authenticateTenant = (req, res, next) => {
  authenticateToken(req, res, () => {
    if (req.user.role !== "tenant") {
      return res.status(403).json({ message: "Unauthorized. Only tenants can access this feature." });
    }
    next();
  });
};

// ✅ Middleware: Restrict to Landlords Only
const authenticateLandlord = (req, res, next) => {
  authenticateToken(req, res, () => {
    if (req.user.role !== "landlord") {
      return res.status(403).json({ message: "Unauthorized. Only landlords can access this feature." });
    }
    next();
  });
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
          return res.status(400).json({ message: "User not found" });
      }

      if (user.role.trim().toLowerCase() !== role.trim().toLowerCase()) {
          return res.status(400).json({ message: "Invalid role selected" });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
          return res.status(400).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign(
          { id: user._id.toString(), role: user.role },
          process.env.JWT_SECRET,
          { expiresIn: "1h" }
      );

      console.log("📌 Generated Token:", token); // ✅ Debugging

      res.status(200).json({
          message: "Login successful",
          token, // ✅ Ensure this is sent
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
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    console.error("❌ Profile Fetch Error:", error);
    res.status(500).json({ message: "Error fetching user profile" });
  }
});

// ✅ Get Tenant Profile (Restricted to Tenants)
router.get("/tenant/profile", authenticateTenant, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "Tenant not found" });

    res.json(user);
  } catch (error) {
    console.error("❌ Tenant Profile Fetch Error:", error);
    res.status(500).json({ message: "Error fetching tenant profile" });
  }
});

// ✅ Get All Users (Only for Landlords)
router.get("/all", authenticateLandlord, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    res.status(500).json({ message: "Error fetching users" });
  }
});

// ✅ Update User Profile
router.put("/profile/update", authenticateToken, async (req, res) => {
  try {
    const { name, phone } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    console.error("❌ Profile Update Error:", error);
    res.status(500).json({ message: "Error updating profile" });
  }
});

// ✅ Delete User (Restricted to Tenants)
router.delete("/delete", authenticateTenant, async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.user.id);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User account deleted successfully" });
  } catch (error) {
    console.error("❌ Account Deletion Error:", error);
    res.status(500).json({ message: "Error deleting account" });
  }
});

export default router;
