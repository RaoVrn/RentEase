import mongoose from "mongoose";

const MaintenanceRequestSchema = new mongoose.Schema({
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ["Pending", "In Progress", "Resolved"], default: "Pending" },
    requestDate: { type: Date, default: Date.now }
});

export default mongoose.model("MaintenanceRequest", MaintenanceRequestSchema);
