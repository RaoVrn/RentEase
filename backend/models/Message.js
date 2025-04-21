// models/Message.js
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    from: {
      type: String,
      enum: ["tenant", "landlord"],
      required: true,
    },
    to: {
      type: String,
      enum: ["tenant", "landlord"],
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },
  },
  { timestamps: true }
);

// ✅ ES Module export
const Message = mongoose.model("Message", messageSchema);
export default Message;
