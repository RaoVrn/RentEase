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

/**
 * @route   GET /api/properties/landlord/:landlordId/properties
 * @desc    Get properties by landlord ID
 */
router.get("/landlord/:landlordId/properties", async (req, res) => {
  try {
    const { landlordId } = req.params;
    console.log("🔍 Fetching properties for landlord:", landlordId);

    const properties = await Property.find({ landlordId });
    console.log(`✅ Found ${properties.length} properties for landlord`);
    res.json(properties);
  } catch (error) {
    console.error("❌ Error fetching landlord properties:", error.message);
    res.status(500).json({ message: "Server error while fetching properties" });
  }
});

/**
 * @route   POST /api/properties/landlord/:landlordId/property
 * @desc    Create a new property for a landlord
 */
router.post("/landlord/:landlordId/property", async (req, res) => {
  try {
    const { landlordId } = req.params;
    console.log("📝 Creating new property for landlord:", landlordId);

    const propertyData = {
      ...req.body,
      landlordId,
      postedOn: new Date()
    };

    const property = new Property(propertyData);
    await property.save();

    console.log("✅ Property created successfully");
    res.status(201).json(property);
  } catch (error) {
    console.error("❌ Error creating property:", error.message);
    res.status(500).json({ message: "Server error while creating property" });
  }
});

/**
 * @route   PUT /api/properties/landlord/property/:propertyId
 * @desc    Update a property
 */
router.put("/landlord/property/:propertyId", async (req, res) => {
  try {
    const { propertyId } = req.params;
    console.log("📝 Updating property:", propertyId);

    const property = await Property.findByIdAndUpdate(
      propertyId,
      { ...req.body },
      { new: true }
    );

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    console.log("✅ Property updated successfully");
    res.json(property);
  } catch (error) {
    console.error("❌ Error updating property:", error.message);
    res.status(500).json({ message: "Server error while updating property" });
  }
});

/**
 * @route   DELETE /api/properties/landlord/property/:propertyId
 * @desc    Delete a property
 */
router.delete("/landlord/property/:propertyId", async (req, res) => {
  try {
    const { propertyId } = req.params;
    console.log("🗑️ Deleting property:", propertyId);

    const property = await Property.findByIdAndDelete(propertyId);

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    console.log("✅ Property deleted successfully");
    res.json({ message: "Property deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting property:", error.message);
    res.status(500).json({ message: "Server error while deleting property" });
  }
});

export default router;
