import mongoose from "mongoose";

const MaintenanceRequestSchema = new mongoose.Schema({
    tenantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    propertyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Property",
        required: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    status: {
        type: String,
        enum: ["Pending", "In Progress", "Resolved"],
        default: "Pending",
    },
    requestDate: {
        type: Date,
        default: Date.now,
    }
}, {
    timestamps: true
});

export default mongoose.model("MaintenanceRequest", MaintenanceRequestSchema);
