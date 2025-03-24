import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
  {
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
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending",
    },
    method: {
      type: String, // e.g. "UPI", "Card"
    },
    dueDate: {
      type: Date, // ✅ Newly added
    },
  },
  { timestamps: true } // ✅ Adds createdAt and updatedAt
);

export default mongoose.model("Payment", PaymentSchema);
