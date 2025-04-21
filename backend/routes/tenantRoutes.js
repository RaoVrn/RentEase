import express from "express";
import mongoose from "mongoose";
import RentApplication from "../models/RentApplication.js";
import Payment from "../models/Payment.js";
import MaintenanceRequest from "../models/MaintenanceRequest.js";
import Message from "../models/Message.js";

const router = express.Router();


// ==============================
// 📄 Rental Applications Routes
// ==============================

// ✅ Get all rental applications for a tenant
router.get("/applications/:tenantId", async (req, res) => {
    try {
        const applications = await RentApplication.find({ tenantId: req.params.tenantId })
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
router.put("/application/:applicationId", async (req, res) => {
    const { status } = req.body;

    if (!["Pending", "Approved", "Rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status update." });
    }

    try {
        const updatedApplication = await RentApplication.findByIdAndUpdate(
            req.params.applicationId,
            { status },
            { new: true }
        );

        if (!updatedApplication) {
            return res.status(404).json({ message: "Application not found." });
        }

        res.json({ message: "Application status updated.", updatedApplication });
    } catch (error) {
        console.error("❌ Error updating application:", error);
        res.status(500).json({ message: "Server error while updating application." });
    }
});


// =======================
// 💳 Payments Routes
// =======================

// ✅ Get all payments for a tenant
router.get("/payments/:tenantId", async (req, res) => {
    try {
        const payments = await Payment.find({ tenantId: req.params.tenantId })
            .populate("propertyId");

        if (!payments.length) {
            return res.status(404).json({ message: "No payments found." });
        }

        res.json(payments);
    } catch (error) {
        console.error("❌ Error fetching payments:", error);
        res.status(500).json({ message: "Server error while fetching payments." });
    }
});

// ✅ Get a single payment by ID
router.get("/payment/:paymentId", async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.paymentId)
            .populate("propertyId");

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

// ✅ Submit a new maintenance request
router.post("/maintenance", async (req, res) => {
    const { tenantId, propertyId, title, description, status, date } = req.body;

    if (!tenantId || !propertyId || !title || !description) {
        return res.status(400).json({ message: "Missing required fields." });
    }

    try {
        const request = new MaintenanceRequest({
            tenantId,
            propertyId,
            title,
            description,
            status: status || "Pending",
            requestDate: date || Date.now()
        });

        await request.save();
        res.status(201).json({ message: "Maintenance request submitted successfully.", request });
    } catch (error) {
        console.error("❌ Error submitting maintenance request:", error);
        res.status(500).json({ message: "Server error while submitting request." });
    }
});

// ✅ Get all maintenance requests for a tenant
router.get("/maintenance/:tenantId", async (req, res) => {
    const { tenantId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(tenantId)) {
        return res.status(400).json({ message: "Invalid tenant ID." });
    }

    try {
        const requests = await MaintenanceRequest.find({ tenantId }).populate("propertyId");
        res.json(requests);
    } catch (error) {
        console.error("❌ Error fetching maintenance requests:", error);
        res.status(500).json({ message: "Server error while fetching maintenance requests." });
    }
});

// ✅ Get a single maintenance request by ID
router.get("/maintenance/request/:requestId", async (req, res) => {
    try {
        const request = await MaintenanceRequest.findById(req.params.requestId).populate("propertyId");

        if (!request) {
            return res.status(404).json({ message: "Maintenance request not found." });
        }

        res.json(request);
    } catch (error) {
        console.error("❌ Error fetching maintenance request:", error);
        res.status(500).json({ message: "Server error while fetching maintenance request." });
    }
});

// ✅ Update maintenance request status
router.put("/maintenance/request/:requestId", async (req, res) => {
    const { status } = req.body;

    if (!["Pending", "In Progress", "Resolved"].includes(status)) {
        return res.status(400).json({ message: "Invalid status update." });
    }

    try {
        const updatedRequest = await MaintenanceRequest.findByIdAndUpdate(
            req.params.requestId,
            { status },
            { new: true }
        );

        if (!updatedRequest) {
            return res.status(404).json({ message: "Maintenance request not found." });
        }

        res.json({ message: "Maintenance request status updated.", updatedRequest });
    } catch (error) {
        console.error("❌ Error updating maintenance request:", error);
        res.status(500).json({ message: "Server error while updating maintenance request." });
    }
});

// ✅ Delete a maintenance request
router.delete("/maintenance/request/:requestId", async (req, res) => {
    try {
        const deleted = await MaintenanceRequest.findByIdAndDelete(req.params.requestId);

        if (!deleted) {
            return res.status(404).json({ message: "Maintenance request not found." });
        }

        res.json({ message: "Maintenance request deleted successfully." });
    } catch (error) {
        console.error("❌ Error deleting maintenance request:", error);
        res.status(500).json({ message: "Server error while deleting request." });
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
    try {
        const messages = await Message.find({ tenantId: req.params.tenantId }).sort({ createdAt: 1 });
        res.json(messages);
    } catch (error) {
        console.error("❌ Error fetching messages:", error);
        res.status(500).json({ message: "Server error while fetching messages." });
    }
});

export default router;
