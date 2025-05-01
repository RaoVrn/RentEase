import express from "express";
import mongoose from "mongoose";
import Payment from "../models/Payment.js";
import Property from "../models/Property.js";
import jwt from "jsonwebtoken";

const router = express.Router();

const authenticateLandlord = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) {
    console.warn("❌ No token provided in Authorization header");
    return res.status(401).json({ message: "Access denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("🟢 Token decoded successfully:", decoded);
    if (decoded.role !== "landlord") {
      console.warn("❌ Unauthorized access: User is not a landlord");
      return res.status(403).json({ message: "Unauthorized access" });
    }
    req.user = decoded;
    next();
  } catch (error) {
    console.error("❌ Invalid token:", error.message);
    res.status(403).json({ message: "Invalid token" });
  }
};

// Get all payments for properties owned by a landlord
router.get("/:landlordId/payments", authenticateLandlord, async (req, res) => {
  const { landlordId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(landlordId)) {
    return res.status(400).json({ message: "Invalid landlord ID." });
  }

  try {
    // Find all properties owned by the landlord
    const properties = await Property.find({ landlordId }).select("_id");

    if (!properties.length) {
      return res.json({ payments: [] }); // Return empty array instead of 404
    }

    const propertyIds = properties.map((property) => property._id);

    // Find all payments for these properties
    const payments = await Payment.find({ propertyId: { $in: propertyIds } })
      .populate("propertyId", "name")
      .populate("tenantId", "name");

    res.json({ payments });
  } catch (error) {
    console.error("❌ Error fetching landlord payments:", error);
    res.status(500).json({ message: "Server error while fetching payments." });
  }
});

export default router;