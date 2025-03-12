import mongoose from "mongoose";

const propertySchema = new mongoose.Schema({
  title: { type: String, required: true },
  location: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
});

const Property = mongoose.model("Property", propertySchema);
export default Property;
