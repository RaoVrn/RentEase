import { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Slider from "rc-slider"; // Import slider
import "rc-slider/assets/index.css"; // Import slider styles

export default function Home() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    city: "",
    bhk: "",
    locality: "",
    furnishingStatus: "",
    tenantPreferred: "",
    areaType: "",
    priceRange: [5000, 50000], // Min & Max Rent
  });

  const [cities, setCities] = useState([]);
  const [bhkOptions, setBhkOptions] = useState([]);
  const [furnishingStatuses, setFurnishingStatuses] = useState([]);
  const [tenantPreferences, setTenantPreferences] = useState([]);
  const [areaTypes, setAreaTypes] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  const fetchFilterOptions = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/properties/filters");
      setCities(response.data.cities || []);
      setBhkOptions(response.data.bhkOptions || []);
      setFurnishingStatuses(response.data.furnishingStatuses || []);
      setTenantPreferences(response.data.tenantPreferences || []);
      setAreaTypes(response.data.areaTypes || []);
    } catch (error) {
      console.error("Error fetching filter options:", error);
    }
  };

  const fetchProperties = async () => {
    setLoading(true);
    setErrorMessage(""); // Reset error message before making a new request
    try {
      const response = await axios.get("http://localhost:5000/api/properties", {
        params: {
          ...filters,
          minPrice: filters.priceRange[0],
          maxPrice: filters.priceRange[1],
        },
      });
      setProperties(response.data);
    } catch (error) {
      console.error("Error fetching properties", error);
      setProperties([]); // Clear properties on error
      if (error.response && error.response.status === 404) {
        setErrorMessage(error.response.data.message); // Show "No properties available" message
      }
    }
    setLoading(false);
  };

  return (
    <div>
      <Navbar />
      <section className="hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>Find Your Dream Rental</h1>
          <p>Discover verified houses, flats, and PGs for rent.</p>
          <div className="search-bar">

            {/* City Dropdown */}
            <select className="city-dropdown" onChange={(e) => setFilters({ ...filters, city: e.target.value })}>
              <option value="" className="default-option">Select City</option>
              {cities.map((city, index) => <option key={index} value={city}>{city}</option>)}
            </select>

            {/* BHK Dropdown */}
            <select onChange={(e) => setFilters({ ...filters, bhk: e.target.value })}>
              <option value="">BHK</option>
              {bhkOptions.map((bhk, index) => <option key={index} value={bhk}>{bhk} BHK</option>)}
            </select>

            {/* Furnishing Status */}
            <select onChange={(e) => setFilters({ ...filters, furnishingStatus: e.target.value })}>
              <option value="">Furnishing</option>
              {furnishingStatuses.map((status, index) => <option key={index} value={status}>{status}</option>)}
            </select>

            {/* Locality Search */}
            <input
              type="text"
              placeholder="Search Locality..."
              className="search-locality"
              onChange={(e) => setFilters({ ...filters, locality: e.target.value })}
            />

            {/* Rent Range Slider */}
            <div className="slider-container">
              <label>Price Range: ₹{filters.priceRange[0]} - ₹{filters.priceRange[1]}</label>
              <Slider
                range
                min={1000}
                max={100000}
                step={1000}
                defaultValue={[5000, 50000]}
                onChange={(value) => setFilters({ ...filters, priceRange: value })}
              />
            </div>

            {/* Search Button */}
            <button onClick={fetchProperties}>Search</button>
          </div>
        </div>
      </section>

      <div className="properties">
        <h2>Available Properties</h2>
        {loading ? <p>Loading properties...</p> : (
          <div className="property-list">
            {errorMessage ? <p>{errorMessage}</p> : properties.length > 0 ? properties.map((property) => (
              <div key={property._id} className="property-card">
                <h3>{property.bhk} BHK in {property.areaLocality}</h3>
                <p>{property.city}</p>
                <p>{property.furnishingStatus} | {property.tenantPreferred}</p>
                <p>{property.areaType} | {property.size} sq.ft</p>
                <p>₹{property.rent}/month</p>
              </div>
            )) : <p>No properties available.</p>}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
