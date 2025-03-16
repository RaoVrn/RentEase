import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Slider from "rc-slider"; 
import "rc-slider/assets/index.css"; 

export default function Home() {
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
  const [tenantPreferences, setTenantPreferences] = useState([]);
  const [areaTypes, setAreaTypes] = useState([]);

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

  const handleSearch = () => {
    const queryParams = new URLSearchParams({
      city: filters.city,
      bhk: filters.bhk,
      furnishingStatus: filters.furnishingStatus,
      locality: filters.locality,
      tenantPreferred: filters.tenantPreferred,
      areaType: filters.areaType,
      minPrice: filters.priceRange[0],
      maxPrice: filters.priceRange[1],
    });

    router.push(`/properties?${queryParams.toString()}`);
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

            <select className="city-dropdown" onChange={(e) => setFilters({ ...filters, city: e.target.value })}>
              <option value="">Select City</option>
              {cities.map((city, index) => <option key={index} value={city}>{city}</option>)}
            </select>

            <select onChange={(e) => setFilters({ ...filters, bhk: e.target.value })}>
              <option value="">BHK</option>
              {bhkOptions.map((bhk, index) => <option key={index} value={bhk}>{bhk} BHK</option>)}
            </select>

            <select onChange={(e) => setFilters({ ...filters, furnishingStatus: e.target.value })}>
              <option value="">Furnishing</option>
              {furnishingStatuses.map((status, index) => <option key={index} value={status}>{status}</option>)}
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
        </div>
      </section>

      {/* 🌆 Popular Cities Section */}
      <section className="popular-cities">
        <h2>Popular Cities</h2>
        <div className="city-grid">
          {[
            { name: "Mumbai", img: "/images/mumbai.jpg" },
            { name: "Delhi", img: "/images/delhi1.jpg" },
            { name: "Hyderabad", img: "/images/hyderabad.jpg" },
            { name: "Chennai", img: "/images/chennai.jpg" },
            { name: "Kolkata", img: "/images/kolkata1.jpg" },
            { name: "Bangalore", img: "/images/banglore1.jpg" }
          ].map((city, index) => (
            <div key={index} className={`city-card ${index < 6 ? "first-row" : "second-row"}`}>
              <img src={city.img} alt={city.name} />
              <h3>{city.name}</h3>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
