import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema({
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ["Pending", "Completed", "Failed"], default: "Pending" },
    paymentDate: { type: Date, default: Date.now }
});

export default mongoose.model("Payment", PaymentSchema);
