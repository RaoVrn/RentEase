import mongoose from "mongoose";

const propertySchema = new mongoose.Schema({
  landlordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  postedOn: { type: Date, required: true },
  bhk: { type: Number, required: true },
  rent: { type: Number, required: true },
  size: { type: Number, required: true },
  floor: { type: String, required: true },
  areaType: { type: String, required: true },
  areaLocality: { type: String, required: true },
  city: { type: String, required: true },
  furnishingStatus: { type: String, required: true },
  tenantPreferred: { type: String, required: true },
  bathroom: { type: Number, required: true },
  pointOfContact: { type: String, required: true },
  image: {
    type: String,
    required: false,
    default: "https://example.com/default-image.jpg"
  },
  // ✅ Reference to Tenant
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false // Optional if not yet rented
  }
});

const Property = mongoose.model("Property", propertySchema);
export default Property;
