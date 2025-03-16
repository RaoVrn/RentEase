import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import Slider from "rc-slider";
// import styles from "../styles/searchbar.module.css";
import "rc-slider/assets/index.css";

const SearchBar = () => {
  const router = useRouter();
  const [filters, setFilters] = useState({
    city: "",
    bhk: "",
    locality: "",
    furnishingStatus: "",
    tenantPreferred: "",
    areaType: "",
    priceRange: [5000, 50000],
  });

  const [cities, setCities] = useState([]);
  const [bhkOptions, setBhkOptions] = useState([]);
  const [furnishingStatuses, setFurnishingStatuses] = useState([]);

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  const fetchFilterOptions = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/properties/filters");
      setCities(response.data.cities || []);
      setBhkOptions(response.data.bhkOptions || []);
      setFurnishingStatuses(response.data.furnishingStatuses || []);
    } catch (error) {
      console.error("Error fetching filter options:", error);
    }
  };

  const handleSearch = () => {
    const queryParams = new URLSearchParams({
      city: filters.city,
      bhk: filters.bhk,
      furnishingStatus: filters.furnishingStatus,
      locality: filters.locality,
      minPrice: filters.priceRange[0],
      maxPrice: filters.priceRange[1],
    });
    router.push(`/properties?${queryParams.toString()}`);
  };

  return (
    <div className="search-bar">
      <select onChange={(e) => setFilters({ ...filters, city: e.target.value })}>
        <option value="">Select City</option>
        {cities.map((city, index) => (
          <option key={index} value={city}>{city}</option>
        ))}
      </select>
      <select onChange={(e) => setFilters({ ...filters, bhk: e.target.value })}>
        <option value="">BHK</option>
        {bhkOptions.map((bhk, index) => (
          <option key={index} value={bhk}>{bhk} BHK</option>
        ))}
      </select>
      <select onChange={(e) => setFilters({ ...filters, furnishingStatus: e.target.value })}>
        <option value="">Furnishing</option>
        {furnishingStatuses.map((status, index) => (
          <option key={index} value={status}>{status}</option>
        ))}
      </select>
      <input
        type="text"
        placeholder="Search Locality..."
        onChange={(e) => setFilters({ ...filters, locality: e.target.value })}
      />
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
      <button onClick={handleSearch}>Search</button>
    </div>
  );
};

export default SearchBar;
