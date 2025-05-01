import express from "express";
import mongoose from "mongoose";
import Payment from "../models/Payment.js";
import Property from "../models/Property.js";
import Message from "../models/Message.js";
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

// Get all conversations for a landlord
router.get("/:landlordId/conversations", authenticateLandlord, async (req, res) => {
  const { landlordId } = req.params;
  console.log("🟢 Fetching conversations for landlord:", landlordId);

  if (!mongoose.Types.ObjectId.isValid(landlordId)) {
    console.warn("❌ Invalid landlord ID:", landlordId);
    return res.status(400).json({ message: "Invalid landlord ID." });
  }

  try {
    // Find all properties owned by the landlord
    const properties = await Property.find({ landlordId }).select("_id name");
    console.log("🟢 Found properties:", properties.length);

    if (!properties.length) {
      console.log("ℹ️ No properties found for landlord");
      return res.json([]); // Return empty array instead of object
    }

    const propertyIds = properties.map((property) => property._id);
    console.log("🟢 Property IDs:", propertyIds);

    // Find all unique tenants who have sent messages to the landlord
    const conversations = await Message.aggregate([
      {
        $match: {
          propertyId: { $in: propertyIds },
          from: "tenant"
        }
      },
      {
        $group: {
          _id: "$tenantId",
          lastMessage: { $last: "$$ROOT" }
        }
      },
      {
        $lookup: {
          from: "tenants",
          localField: "_id",
          foreignField: "_id",
          as: "tenant"
        }
      },
      {
        $unwind: "$tenant"
      },
      {
        $lookup: {
          from: "properties",
          localField: "lastMessage.propertyId",
          foreignField: "_id",
          as: "property"
        }
      },
      {
        $unwind: "$property"
      },
      {
        $project: {
          _id: "$tenant._id",
          name: "$tenant.name",
          propertyName: "$property.name",
          lastMessage: {
            text: "$lastMessage.text",
            createdAt: "$lastMessage.createdAt"
          }
        }
      }
    ]);

    console.log("🟢 Found conversations:", conversations.length);
    res.json(conversations);
  } catch (error) {
    console.error("❌ Error fetching conversations:", error);
    res.status(500).json({ message: "Server error while fetching conversations." });
  }
});

// Get messages between landlord and a specific tenant
router.get("/messages/:tenantId", authenticateLandlord, async (req, res) => {
  const { tenantId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(tenantId)) {
    return res.status(400).json({ message: "Invalid tenant ID." });
  }

  try {
    const messages = await Message.find({
      tenantId,
      $or: [
        { from: "tenant", to: "landlord" },
        { from: "landlord", to: "tenant" }
      ]
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    console.error("❌ Error fetching messages:", error);
    res.status(500).json({ message: "Server error while fetching messages." });
  }
});

// Send a message to a tenant
router.post("/messages", authenticateLandlord, async (req, res) => {
  const { tenantId, text } = req.body;

  if (!mongoose.Types.ObjectId.isValid(tenantId)) {
    return res.status(400).json({ message: "Invalid tenant ID." });
  }

  if (!text || text.trim() === "") {
    return res.status(400).json({ message: "Message text is required." });
  }

  try {
    // Find the property where this tenant is renting
    const property = await Property.findOne({ tenants: tenantId });
    
    if (!property) {
      return res.status(400).json({ message: "Tenant is not associated with any property." });
    }

    const message = new Message({
      from: "landlord",
      to: "tenant",
      text,
      tenantId,
      propertyId: property._id
    });

    await message.save();
    res.status(201).json(message);
  } catch (error) {
    console.error("❌ Error sending message:", error);
    res.status(500).json({ message: "Server error while sending message." });
  }
});

export default router;