import express from "express";
import Property from "../models/Property.js";

const router = express.Router();

/**
 * @route   GET /api/properties/filters
 * @desc    Get distinct filter options for properties
 */
router.get("/filters", async (req, res) => {
  try {
    console.log("📦 Fetching property filters...");

    const cities = await Property.distinct("city");
    const bhkOptions = await Property.distinct("bhk");
    const furnishingStatuses = await Property.distinct("furnishingStatus");
    const tenantPreferences = await Property.distinct("tenantPreferred");
    const areaTypes = await Property.distinct("areaType");

    console.log("✅ Filters fetched successfully.");
    res.json({
      cities,
      bhkOptions,
      furnishingStatuses,
      tenantPreferences,
      areaTypes,
    });
  } catch (error) {
    console.error("❌ Error fetching filter options:", error.message);
    res
      .status(500)
      .json({ message: "Server error while fetching filter options" });
  }
});

/**
 * @route   GET /api/properties
 * @desc    Get all properties or filter by query
 */
router.get("/", async (req, res) => {
  try {
    console.log("🔍 Fetching properties with filters:", req.query);

    const {
      city,
      bhk,
      furnishingStatus,
      tenantPreferred,
      areaType,
      locality,
      minPrice,
      maxPrice,
    } = req.query;

    const filters = {};

    if (city) filters.city = city;
    if (bhk) filters.bhk = Number(bhk);
    if (furnishingStatus) filters.furnishingStatus = furnishingStatus;
    if (tenantPreferred) filters.tenantPreferred = tenantPreferred;
    if (areaType) filters.areaType = areaType;
    if (locality)
      filters.areaLocality = new RegExp(`^${locality.trim()}$`, "i");

    if (minPrice || maxPrice) {
      filters.rent = {};
      if (minPrice) filters.rent.$gte = Number(minPrice);
      if (maxPrice) filters.rent.$lte = Number(maxPrice);
    }

    console.log("📌 Final query filters:", filters);

    const properties = await Property.find(filters);

    console.log(`✅ Found ${properties.length} properties.`);

    // Send an empty array instead of 404 to avoid frontend crashing
    res.json(properties);
  } catch (error) {
    console.error("❌ Error fetching properties:", error.message);
    res
      .status(500)
      .json({ message: "Server error while fetching properties" });
  }
});

export default router;
