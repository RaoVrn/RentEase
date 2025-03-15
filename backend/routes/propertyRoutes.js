import express from "express";
import Property from "../models/Property.js";

const router = express.Router();

// Fetch all unique filter values dynamically
router.get("/filters", async (req, res) => {
  try {
    const cities = await Property.distinct("city", { city: { $exists: true, $ne: "" } });
    const bhkOptions = await Property.distinct("bhk", { bhk: { $exists: true, $ne: null } });
    const furnishingStatuses = await Property.distinct("furnishingStatus", { furnishingStatus: { $exists: true, $ne: "" } });
    const tenantPreferences = await Property.distinct("tenantPreferred", { tenantPreferred: { $exists: true, $ne: "" } });
    const areaTypes = await Property.distinct("areaType", { areaType: { $exists: true, $ne: "" } });

    res.json({ cities, bhkOptions, furnishingStatuses, tenantPreferences, areaTypes });
  } catch (error) {
    console.error("Error fetching filter options:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Fetch properties with filters, including **strict locality search**
router.get("/", async (req, res) => {
  try {
    let filters = {};

    if (req.query.city) filters.city = req.query.city;
    if (req.query.bhk) filters.bhk = Number(req.query.bhk);
    if (req.query.furnishingStatus) filters.furnishingStatus = req.query.furnishingStatus;
    if (req.query.tenantPreferred) filters.tenantPreferred = req.query.tenantPreferred;
    if (req.query.areaType) filters.areaType = req.query.areaType;

    // Locality search - strict filtering to show only results from that locality
    if (req.query.locality && req.query.locality.trim() !== "") {
      filters.areaLocality = new RegExp(`^${req.query.locality.trim()}$`, "i"); // Case-insensitive exact match
    }

    if (req.query.minPrice || req.query.maxPrice) {
      filters.rent = {};
      if (req.query.minPrice) filters.rent.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) filters.rent.$lte = Number(req.query.maxPrice);
    }

    const properties = await Property.find(filters);

    // If no properties found, return a custom message
    if (properties.length === 0) {
      return res.status(404).json({ message: "No property available in this area." });
    }

    res.json(properties);
  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
