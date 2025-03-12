import express from "express";
import Property from "../models/Property.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const properties = await Property.find();
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: "Error fetching properties" });
  }
});

router.post("/", async (req, res) => {
  const { title, location, price, image } = req.body;
  try {
    const newProperty = new Property({ title, location, price, image });
    await newProperty.save();
    res.status(201).json(newProperty);
  } catch (error) {
    res.status(400).json({ message: "Error adding property" });
  }
});

export default router;
