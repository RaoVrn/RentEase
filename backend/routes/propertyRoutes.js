import express from "express";
import Property from "../models/Property.js";

const router = express.Router();

router.get("/filters", async (req, res) => {
  try {
    const cities = await Property.distinct("city");
    const bhkOptions = await Property.distinct("bhk");
    const furnishingStatuses = await Property.distinct("furnishingStatus");
    const tenantPreferences = await Property.distinct("tenantPreferred");
    const areaTypes = await Property.distinct("areaType");

    res.json({ cities, bhkOptions, furnishingStatuses, tenantPreferences, areaTypes });
  } catch (error) {
    console.error("Error fetching filter options:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/", async (req, res) => {
  try {
    let filters = {};
    if (req.query.city) filters.city = req.query.city;
    if (req.query.bhk) filters.bhk = Number(req.query.bhk);
    if (req.query.furnishingStatus) filters.furnishingStatus = req.query.furnishingStatus;
    if (req.query.locality) filters.areaLocality = new RegExp(`^${req.query.locality.trim()}$`, "i");
    if (req.query.minPrice || req.query.maxPrice) {
      filters.rent = {};
      if (req.query.minPrice) filters.rent.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) filters.rent.$lte = Number(req.query.maxPrice);
    }

    const properties = await Property.find(filters);
    if (properties.length === 0) {
      return res.status(404).json({ message: "No property available in this area." });
    }
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
