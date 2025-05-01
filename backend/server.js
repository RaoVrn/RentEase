import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import { Server } from "socket.io";
import http from "http";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

// Routes
import propertyRoutes from "./routes/propertyRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import geminiRoutes from "./routes/geminiRoutes.js";
import tenantRoutes from "./routes/tenantRoutes.js";
import landlordRoutes from "./routes/landlordRoutes.js";

import RentApplication from "./models/RentApplication.js";

// ✅ Load .env variables
dotenv.config();
const app = express();
const server = http.createServer(app);

// ✅ Resolve __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ WebSocket Setup
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// ✅ MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};
connectDB();

// ✅ Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // ✅ Needed for file/form data
app.use(cors());

// ✅ Static Files: Serve uploaded avatars/images
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// ✅ API Routes
app.use("/api/properties", propertyRoutes);
app.use("/api/users", userRoutes);
app.use("/api/gemini", geminiRoutes);
app.use("/api/tenant", tenantRoutes);
app.use("/api/landlord", landlordRoutes);

// ✅ WebSocket Events
io.on("connection", (socket) => {
  console.log("🟢 Client connected:", socket.id);

  socket.on("getApplications", async (tenantId) => {
    try {
      const applications = await RentApplication.find({ tenantId })
        .populate("propertyId")
        .populate("tenantId", "name email");

      socket.emit("applicationsData", applications);
    } catch (error) {
      console.error("❌ Error fetching applications:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected");
  });
});

// ✅ Gemini FastAPI Proxy Endpoint
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

// ✅ Health Check Route
app.get("/", (req, res) => {
  res.send("Welcome to the RentEase API 🚀");
});

// ✅ 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
