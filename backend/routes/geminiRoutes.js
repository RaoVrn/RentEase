import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/generate", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    console.log("Received Prompt:", prompt);

    // Use Gemini 1.5 Pro Latest Model
    const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-pro-latest" });

    const result = await model.generateContent({ contents: [{ role: "user", parts: [{ text: prompt }] }] });

    console.log("API Response:", result);

    // Extract text response properly
    const responseText =
      result?.response?.candidates?.[0]?.content?.parts?.map(part => part.text).join("") ||
      "No valid response from AI";

    res.json({ response: responseText });
  } catch (error) {
    console.error("Gemini API Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch response from Gemini AI" });
  }
});

// Temporary endpoint to list supported models
router.get("/models", async (req, res) => {
  try {
    const models = await genAI.listModels();
    console.log("Supported Models:", models);
    res.json(models);
  } catch (error) {
    console.error("List Models Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Unable to fetch models" });
  }
});

export default router;
