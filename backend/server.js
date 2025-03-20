import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import propertyRoutes from "./routes/propertyRoutes.js";
import userRoutes from "./routes/userRoutes.js";
<<<<<<< HEAD
import geminiRoutes from "./routes/geminiRoutes.js"; // ✅ Import Gemini Route
=======
import fetch from "node-fetch"; // Import fetch to call Python FastAPI
>>>>>>> 7b13642 (Enhance Keyara UI, integrate auth, connect backend)

dotenv.config(); // Load environment variables

const app = express();
app.use(express.json());
app.use(cors());
<<<<<<< HEAD
=======

// ✅ Connect to MongoDB with better error handling
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    process.exit(1); // Exit on failure
  }
};
connectDB();

// ✅ API Routes
>>>>>>> 7b13642 (Enhance Keyara UI, integrate auth, connect backend)
app.use("/api/properties", propertyRoutes);
app.use("/api/users", userRoutes);
app.use("/api/gemini", geminiRoutes); // ✅ Ensure this is added

// ✅ Forward AI requests to FastAPI backend
app.post("/api/gemini/generate", async (req, res) => {
  try {
    const response = await fetch("http://localhost:8000/api/gemini/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    if (!response.ok) {
      throw new Error(`FastAPI responded with status ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("❌ Error forwarding request to FastAPI:", error.message);
    res.status(500).json({ error: "Error communicating with Gemini AI backend." });
  }
});

// ✅ Default Route
app.get("/", (req, res) => {
  res.send("Welcome to the RentEase API 🚀");
});

// ✅ 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
