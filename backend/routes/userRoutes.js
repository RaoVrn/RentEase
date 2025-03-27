import express from "express";
import User from "../models/User.js";
import Property from "../models/Property.js"; // ✅ Import Property model
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// =======================
// 🔐 Middleware
// =======================

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

const authenticateTenant = (req, res, next) => {
  authenticateToken(req, res, () => {
    if (req.user.role !== "tenant") {
      return res.status(403).json({ message: "Unauthorized. Only tenants allowed." });
    }
    next();
  });
};

const authenticateLandlord = (req, res, next) => {
  authenticateToken(req, res, () => {
    if (req.user.role !== "landlord") {
      return res.status(403).json({ message: "Unauthorized. Only landlords allowed." });
    }
    next();
  });
};

// =======================
// 📝 Register
// =======================
router.post("/register", async (req, res) => {
  const { name, email, password, role, phone } = req.body;

  console.log("📌 Register Payload:", req.body);

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, Email, and Password are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword, role, phone });
    await newUser.save();

    res.status(201).json({
      message: "User registered successfully",
      user: { id: newUser._id, name, email, role, phone },
    });
  } catch (error) {
    console.error("❌ Registration Error:", error);
    res.status(500).json({ message: "Error registering user" });
  }
});

// =======================
// 🔐 Login
// =======================
router.post("/login", async (req, res) => {
  const { email, password, role } = req.body;
  console.log("📌 Login Attempt:", req.body);

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    if (user.role.trim().toLowerCase() !== role.trim().toLowerCase()) {
      return res.status(400).json({ message: "Invalid role selected" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(400).json({ message: "Invalid credentials" });

    // ✅ Check propertyId for tenants
    let propertyId = null;
    if (user.role === "tenant") {
      const property = await Property.findOne({ tenantId: user._id }).select("_id");
      console.log("📦 Found property:", property); // ✅ moved inside
      propertyId = property?._id || null;
      console.log("📦 Assigned propertyId:", propertyId); // ✅ optional log
    }

    const token = jwt.sign(
      { id: user._id.toString(), role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // ✅ Send response with propertyId
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        propertyId: propertyId,
      },
    });
  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({ message: "Error logging in" });
  }
});

// =======================
// 👤 Get Profile
// =======================
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    console.error("❌ Fetch Profile Error:", error);
    res.status(500).json({ message: "Error fetching user profile" });
  }
});

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

// =======================
// 🔍 Admin: All Users
// =======================
router.get("/all", authenticateLandlord, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    console.error("❌ Fetch All Users Error:", error);
    res.status(500).json({ message: "Error fetching users" });
  }
});

// =======================
// 🛠️ Update Profile
// =======================
router.put("/profile/update", authenticateToken, async (req, res) => {
  const { name, phone } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Profile updated", user: updatedUser });
  } catch (error) {
    console.error("❌ Update Profile Error:", error);
    res.status(500).json({ message: "Error updating profile" });
  }
});

// =======================
// ❌ Delete Account
// =======================
router.delete("/delete", authenticateTenant, async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.user.id);
    if (!deleted) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("❌ Delete Account Error:", error);
    res.status(500).json({ message: "Error deleting account" });
  }
});

export default router;
