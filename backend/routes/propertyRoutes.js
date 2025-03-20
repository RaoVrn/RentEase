import express from "express";
import Property from "../models/Property.js";

const router = express.Router();

// ✅ Route: Get distinct filter options for properties
router.get("/filters", async (req, res) => {
  try {
    console.log("Fetching property filters...");

    const cities = await Property.distinct("city");
    const bhkOptions = await Property.distinct("bhk");
    const furnishingStatuses = await Property.distinct("furnishingStatus");
    const tenantPreferences = await Property.distinct("tenantPreferred");
    const areaTypes = await Property.distinct("areaType");

    console.log("Filters fetched successfully.");
    res.json({ cities, bhkOptions, furnishingStatuses, tenantPreferences, areaTypes });
  } catch (error) {
    console.error("Error fetching filter options:", error.message);
    res.status(500).json({ message: "Server error while fetching filter options" });
  }
});

// ✅ Route: Get properties based on filters
router.get("/", async (req, res) => {
  try {
    console.log("Fetching properties with filters:", req.query);

    let filters = {};

    if (req.query.city) filters.city = req.query.city;
    if (req.query.bhk) filters.bhk = Number(req.query.bhk);
    if (req.query.furnishingStatus) filters.furnishingStatus = req.query.furnishingStatus;
    if (req.query.tenantPreferred) filters.tenantPreferred = req.query.tenantPreferred;
    if (req.query.areaType) filters.areaType = req.query.areaType;
    if (req.query.locality) filters.areaLocality = new RegExp(`^${req.query.locality.trim()}$`, "i");

    if (req.query.minPrice || req.query.maxPrice) {
      filters.rent = {};
      if (req.query.minPrice) filters.rent.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) filters.rent.$lte = Number(req.query.maxPrice);
    }

    console.log("Applying filters:", filters);
    
    const properties = await Property.find(filters);

    if (!properties.length) {
      return res.status(404).json({ message: "No property available for the selected filters." });
    }

    console.log(`Found ${properties.length} properties.`);
    res.json(properties);
  } catch (error) {
    console.error("Error fetching properties:", error.message);
    res.status(500).json({ message: "Server error while fetching properties" });
  }
});

export default router;
