import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, default: "tenant" },  // ✅ Ensure role is saved
  phone: { type: String, default: null },  // ✅ Ensure phone is saved
}, { timestamps: true });

export default mongoose.model("User", UserSchema);
