import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    role: {
      type: String,
      enum: ["tenant", "landlord"],
      default: "tenant",
      required: true,
    },
    phone: {
      type: String,
      default: null,
      trim: true,
    },
    address: {
      type: String,
      default: "",
      trim: true,
    },
    avatar: {
      type: String,
      default: "", // Example: "/uploads/avatar123.jpg"
    },
    joinedAt: {
      type: Date,
      default: Date.now, // Optional: could use timestamps.createdAt instead
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

export default mongoose.model("User", UserSchema);
