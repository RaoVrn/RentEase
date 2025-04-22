import express from "express";
import User from "../models/User.js";
import Property from "../models/Property.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

// =======================
// 🗂️ Multer Setup
// =======================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "public/uploads";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}-${file.fieldname}${ext}`;
    cb(null, filename);
  },
});
const upload = multer({ storage });

// =======================
// 🔐 Middleware
// =======================
const authenticateToken = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Access denied. No token provided." });

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

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    if (user.role.trim().toLowerCase() !== role.trim().toLowerCase()) {
      return res.status(400).json({ message: "Invalid role selected" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(400).json({ message: "Invalid credentials" });

    // ✅ Fetch propertyId assigned to tenant (if applicable)
    let propertyId = null;
    if (user.role === "tenant") {
      const property = await Property.findOne({ tenantId: user._id }).select("_id");
      propertyId = property?._id || null;
    }

    const token = jwt.sign(
      { id: user._id.toString(), role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        propertyId, // ✅ included
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
// 🛠️ Update Profile with Avatar Upload
// =======================
router.put("/profile/update", authenticateToken, upload.single("avatar"), async (req, res) => {
  try {
    console.log("📥 File received:", req.file);
    console.log("📝 Body received:", req.body);

    const { name, phone, address } = req.body;

    let avatarUrl;
    if (req.file) {
      avatarUrl = `/uploads/${req.file.filename}`;
    }

    const updatedFields = {
      name,
      phone,
      address,
      ...(avatarUrl && { avatar: avatarUrl }),
    };

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      updatedFields,
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

// =======================
// 🧾 Get All Users (Landlord)
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

export default router;
