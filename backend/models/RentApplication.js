import mongoose from "mongoose";

const RentApplicationSchema = new mongoose.Schema(
    {
        tenantId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User", 
            required: true 
        },
        propertyId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Property", 
            required: true 
        },
        status: { 
            type: String, 
            enum: ["Pending", "Approved", "Rejected"], 
            default: "Pending" 
        },
        submittedAt: { 
            type: Date, 
            default: Date.now 
        }
    },
    { timestamps: true } // ✅ Adds createdAt and updatedAt fields automatically
);

// ✅ Export Model
export default mongoose.model("RentApplication", RentApplicationSchema);
