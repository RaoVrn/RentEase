import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import propertyRoutes from "./routes/propertyRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import geminiRoutes from "./routes/geminiRoutes.js"; // ✅ Import Gemini Route

dotenv.config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB Connection Error:", err));

const app = express();
app.use(express.json());
app.use(cors());
app.use("/api/properties", propertyRoutes);
app.use("/api/users", userRoutes);
app.use("/api/gemini", geminiRoutes); // ✅ Ensure this is added

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
