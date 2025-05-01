import express from "express";
import mongoose from "mongoose";
import RentApplication from "../models/RentApplication.js";
import Payment from "../models/Payment.js";
import MaintenanceRequest from "../models/MaintenanceRequest.js";
import Message from "../models/Message.js";
import Property from "../models/Property.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Access denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ message: "Invalid token" });
  }
};

// Add logging to debug token validation in authenticateLandlord middleware
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

// ==============================
// 📄 Rental Applications Routes
// ==============================

// ✅ Get all rental applications for a tenant
router.get("/applications/:tenantId", async (req, res) => {
  const { tenantId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(tenantId)) {
    console.warn("❌ Invalid tenantId for applications:", tenantId);
    return res.status(400).json({ message: "Invalid tenant ID." });
  }

  try {
    const applications = await RentApplication.find({ tenantId })
      .populate("propertyId")
      .populate("tenantId", "name email");

    if (!applications.length) {
      return res.status(404).json({ message: "No rental applications found." });
    }

    res.json(applications);
  } catch (error) {
    console.error("❌ Error fetching applications:", error);
    res.status(500).json({ message: "Server error while fetching applications." });
  }
});

// ✅ Get all rental applications for properties owned by a landlord
router.get("/landlord/:landlordId/applications", authenticateLandlord, async (req, res) => {
  const { landlordId } = req.params;

  // Verify the authenticated landlord matches the requested landlordId
  if (req.user.id !== landlordId) {
    return res.status(403).json({ 
      success: false,
      message: "Unauthorized access to applications" 
    });
  }

  if (!mongoose.Types.ObjectId.isValid(landlordId)) {
    console.warn("❌ Invalid landlordId for applications:", landlordId);
    return res.status(400).json({ 
      success: false,
      message: "Invalid landlord ID" 
    });
  }

  try {
    // First get all properties owned by this landlord
    const properties = await Property.find({ landlordId }).select('_id');
    
    if (!properties.length) {
      return res.status(200).json({ 
        success: true,
        message: "No properties found for landlord",
        applications: [] 
      });
    }
    
    const propertyIds = properties.map(p => p._id);

    // Then find all applications for these properties
    const applications = await RentApplication.find({
      propertyId: { $in: propertyIds }
    })
      .populate('propertyId')
      .populate('tenantId', 'name email')
      .sort({ submittedAt: -1 });

    res.status(200).json({
      success: true,
      applications
    });
  } catch (error) {
    console.error("❌ Error fetching landlord applications:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error while fetching applications",
      error: error.message 
    });
  }
});

// ✅ Get a single rental application by ID
router.get("/application/:applicationId", async (req, res) => {
  try {
    const application = await RentApplication.findById(req.params.applicationId)
      .populate("propertyId")
      .populate("tenantId", "name email");

    if (!application) {
      return res.status(404).json({ message: "Application not found." });
    }

    res.json(application);
  } catch (error) {
    console.error("❌ Error fetching application:", error);
    res.status(500).json({ message: "Server error while fetching application." });
  }
});

// ✅ Update rental application status
router.put("/application/:applicationId", authenticateLandlord, async (req, res) => {
  const { status } = req.body;

  if (!["Pending", "Approved", "Rejected"].includes(status)) {
    return res.status(400).json({ message: "Invalid status update." });
  }

  try {
    // First get the application to check if landlord owns the property
    const application = await RentApplication.findById(req.params.applicationId)
      .populate('propertyId');

    if (!application) {
      return res.status(404).json({ message: "Application not found." });
    }

    // Verify the landlord owns the property
    if (application.propertyId.landlordId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized to update this application." });
    }

    application.status = status;
    application.updatedAt = new Date();
    await application.save();

    // Return populated application
    const updatedApplication = await RentApplication.findById(application._id)
      .populate('propertyId')
      .populate('tenantId', 'name email');

    res.json({ 
      message: `Application ${status.toLowerCase()} successfully`, 
      application: updatedApplication 
    });
  } catch (error) {
    console.error("❌ Error updating application:", error);
    res.status(500).json({ 
      message: "Server error while updating application.",
      error: error.message
    });
  }
});

// =======================
// 💳 Payments Routes
// =======================

// ✅ Get all payments for a tenant
router.get("/payments/:tenantId", async (req, res) => {
  const { tenantId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(tenantId)) {
    console.warn("❌ Invalid tenantId for payments:", tenantId);
    return res.status(400).json({ message: "Invalid tenant ID." });
  }

  try {
    const payments = await Payment.find({ tenantId }).populate("propertyId");

    if (!payments.length) {
      return res.status(404).json({ message: "No payments found." });
    }

    res.json(payments);
  } catch (error) {
    console.error("❌ Error fetching payments:", error);
    res.status(500).json({ message: "Server error while fetching payments." });
  }
});

// ✅ Get all payments for properties owned by a landlord
router.get("/landlord/:landlordId/payments", authenticateLandlord, async (req, res) => {
  const { landlordId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(landlordId)) {
    return res.status(400).json({ message: "Invalid landlord ID." });
  }

  try {
    // Find all properties owned by the landlord
    const properties = await Property.find({ landlordId }).select("_id");

    if (!properties.length) {
      return res.status(404).json({ message: "No properties found for this landlord." });
    }

    const propertyIds = properties.map((property) => property._id);

    // Find all payments for these properties
    const payments = await Payment.find({ propertyId: { $in: propertyIds } })
      .populate("propertyId", "name")
      .populate("tenantId", "name");

    if (!payments.length) {
      return res.status(404).json({ message: "No payments found for this landlord." });
    }

    res.json(payments);
  } catch (error) {
    console.error("❌ Error fetching landlord payments:", error);
    res.status(500).json({ message: "Server error while fetching payments." });
  }
});

// ✅ Get a single payment by ID
router.get("/payment/:paymentId", async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId).populate("propertyId");

    if (!payment) {
      return res.status(404).json({ message: "Payment not found." });
    }

    res.json(payment);
  } catch (error) {
    console.error("❌ Error fetching payment:", error);
    res.status(500).json({ message: "Server error while fetching payment." });
  }
});

// ==============================
// 🛠️ Maintenance Request Routes
// ==============================

// ✅ Get all maintenance requests for a tenant
router.get("/maintenance/:tenantId", authenticateToken, async (req, res) => {
  const { tenantId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(tenantId)) {
    return res.status(400).json({ message: "Invalid tenant ID format" });
  }

  try {
    const requests = await MaintenanceRequest.find({ tenantId })
      .populate("propertyId")
      .sort({ requestDate: -1 }); // Newest first
    res.json(requests);
  } catch (error) {
    console.error("Error fetching maintenance requests:", error);
    res.status(500).json({ message: "Error fetching maintenance requests" });
  }
});

// ✅ Get all maintenance requests for properties owned by a landlord
router.get("/landlord/:landlordId/maintenance-requests", authenticateLandlord, async (req, res) => {
  const { landlordId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(landlordId)) {
    return res.status(400).json({ message: "Invalid landlord ID." });
  }

  try {
    // First get all properties owned by the landlord
    const properties = await Property.find({ landlordId }).select("_id");

    if (!properties.length) {
      return res.status(200).json([]); // Return empty array if no properties
    }

    const propertyIds = properties.map((property) => property._id);

    // Find all maintenance requests for these properties
    const requests = await MaintenanceRequest.find({ 
      propertyId: { $in: propertyIds } 
    })
      .populate("propertyId")
      .populate("tenantId", "name email")
      .sort({ requestDate: -1 }); // Newest first

    res.json(requests);
  } catch (error) {
    console.error("❌ Error fetching maintenance requests:", error);
    res.status(500).json({ message: "Server error while fetching maintenance requests" });
  }
});

// ✅ Submit a new maintenance request
router.post("/maintenance", authenticateToken, async (req, res) => {
  const { tenantId, propertyId, title, description, priority } = req.body;

  if (!mongoose.Types.ObjectId.isValid(tenantId) || !mongoose.Types.ObjectId.isValid(propertyId)) {
    return res.status(400).json({ 
      message: "Invalid tenant or property ID",
      code: "INVALID_IDS" 
    });
  }

  try {
    const request = new MaintenanceRequest({
      tenantId,
      propertyId,
      title,
      description,
      priority: priority || "Medium",
      status: "Pending",
      requestDate: new Date()
    });

    await request.save();
    
    const populatedRequest = await MaintenanceRequest.findById(request._id)
      .populate("propertyId");

    res.status(201).json({
      message: "Maintenance request submitted successfully",
      request: populatedRequest
    });
  } catch (error) {
    console.error("Error submitting maintenance request:", error);
    res.status(500).json({ 
      message: "Error submitting maintenance request",
      error: error.message 
    });
  }
});

// ✅ Update a maintenance request
router.put("/maintenance/request/:requestId", authenticateToken, async (req, res) => {
  const { requestId } = req.params;
  const { status, description, priority } = req.body;

  if (!mongoose.Types.ObjectId.isValid(requestId)) {
    return res.status(400).json({ message: "Invalid request ID" });
  }

  try {
    const updateData = {
      ...(status && { status }),
      ...(description && { description }),
      ...(priority && { priority }),
      ...(status === "Resolved" && { resolvedDate: new Date() })
    };

    const updatedRequest = await MaintenanceRequest.findByIdAndUpdate(
      requestId,
      updateData,
      { new: true }
    ).populate("propertyId");

    if (!updatedRequest) {
      return res.status(404).json({ message: "Maintenance request not found" });
    }

    res.json({
      message: "Maintenance request updated successfully",
      request: updatedRequest
    });
  } catch (error) {
    console.error("Error updating maintenance request:", error);
    res.status(500).json({ message: "Error updating maintenance request" });
  }
});

// ✅ Delete a maintenance request
router.delete("/maintenance/request/:requestId", authenticateToken, async (req, res) => {
  const { requestId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(requestId)) {
    return res.status(400).json({ message: "Invalid request ID" });
  }

  try {
    const deletedRequest = await MaintenanceRequest.findByIdAndDelete(requestId);
    
    if (!deletedRequest) {
      return res.status(404).json({ message: "Maintenance request not found" });
    }

    res.json({ message: "Maintenance request deleted successfully" });
  } catch (error) {
    console.error("Error deleting maintenance request:", error);
    res.status(500).json({ message: "Error deleting maintenance request" });
  }
});

// ✅ Add a comment to a maintenance request
router.post("/maintenance/request/:requestId/comment", authenticateToken, async (req, res) => {
  const { requestId } = req.params;
  const { text } = req.body;

  if (!mongoose.Types.ObjectId.isValid(requestId)) {
    return res.status(400).json({ message: "Invalid request ID" });
  }

  try {
    const request = await MaintenanceRequest.findById(requestId);
    
    if (!request) {
      return res.status(404).json({ message: "Maintenance request not found" });
    }

    request.comments.push({
      text,
      author: req.user.id,
      date: new Date()
    });

    await request.save();

    res.json({
      message: "Comment added successfully",
      request
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: "Error adding comment" });
  }
});

// ==============================
// 💬 Messages Routes
// ==============================

// ✅ Send a new message
router.post("/messages", async (req, res) => {
  try {
    const { from, to, text, tenantId } = req.body;

    if (!from || !to || !text || !tenantId) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const message = await Message.create({ from, to, text, tenantId });
    res.status(201).json(message);
  } catch (error) {
    console.error("❌ Error sending message:", error);
    res.status(500).json({ message: "Server error while sending message." });
  }
});

// ✅ Get all messages for a tenant
router.get("/messages/:tenantId", async (req, res) => {
  const { tenantId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(tenantId)) {
    return res.status(400).json({ message: "Invalid tenant ID." });
  }

  try {
    const messages = await Message.find({ tenantId }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    console.error("❌ Error fetching messages:", error);
    res.status(500).json({ message: "Server error while fetching messages." });
  }
});

export default router;
