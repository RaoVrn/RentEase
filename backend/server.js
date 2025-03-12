import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import propertyRoutes from "./routes/propertyRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import connectDB from "./config/db.js";

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/properties", propertyRoutes);
app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
