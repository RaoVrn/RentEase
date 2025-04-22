import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function PropertiesPage() {
  const router = useRouter();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    furnishingStatus: "",
    bhk: "",
  });

  // Property images array for rotation
  const propertyImages = [
    "/images/featuredProperties/property1.jpg",
    "/images/featuredProperties/property2.jpg",
    "/images/featuredProperties/property3.jpg",
    "/images/featuredProperties/property4.jpg",
  ];

  useEffect(() => {
    if (router.isReady) {
      fetchProperties();
    }
  }, [router.isReady, router.query]);

  const fetchProperties = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const response = await axios.get("http://localhost:5000/api/properties", {
        params: { ...router.query, ...filters },
      });
      setProperties(response.data);
    } catch (error) {
      console.error("Error fetching properties", error);
      setProperties([]);
      if (error.response && error.response.status === 404) {
        setErrorMessage(error.response.data.message);
      }
    }
    setLoading(false);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const applyFilters = (e) => {
    e.preventDefault();
    fetchProperties();
  };

  // Get a random image for each property
  const getRandomImage = (index) => {
    return propertyImages[index % propertyImages.length];
  };

  return (
    <div className="properties-page">
      <Navbar />
      <div className="container">
        <motion.h2 
          className="page-title"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Available Properties
        </motion.h2>
        
        <motion.form 
          className="filters-form" 
          onSubmit={applyFilters}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="filters-grid">
            <div className="filter-group">
              <label htmlFor="minPrice">Min Price (₹)</label>
              <input
                type="number"
                id="minPrice"
                name="minPrice"
                value={filters.minPrice}
                onChange={handleFilterChange}
                placeholder="Min Price"
              />
            </div>
            <div className="filter-group">
              <label htmlFor="maxPrice">Max Price (₹)</label>
              <input
                type="number"
                id="maxPrice"
                name="maxPrice"
                value={filters.maxPrice}
                onChange={handleFilterChange}
                placeholder="Max Price"
              />
            </div>
            <div className="filter-group">
              <label htmlFor="furnishingStatus">Furnishing Status</label>
              <select
                id="furnishingStatus"
                name="furnishingStatus"
                value={filters.furnishingStatus}
                onChange={handleFilterChange}
              >
                <option value="">All</option>
                <option value="Unfurnished">Unfurnished</option>
                <option value="Semi-Furnished">Semi-Furnished</option>
                <option value="Fully-Furnished">Fully-Furnished</option>
              </select>
            </div>
            <div className="filter-group">
              <label htmlFor="bhk">BHK</label>
              <select
                id="bhk"
                name="bhk"
                value={filters.bhk}
                onChange={handleFilterChange}
              >
                <option value="">All</option>
                <option value="1">1 BHK</option>
                <option value="2">2 BHK</option>
                <option value="3">3 BHK</option>
                <option value="4">4+ BHK</option>
              </select>
            </div>
            <button type="submit" className="filter-button">
              <span className="button-text">Apply Filters</span>
              <span className="button-icon">🔍</span>
            </button>
          </div>
        </motion.form>

        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Finding perfect properties for you...</p>
          </div>
        ) : (
          <motion.div 
            className="property-grid"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
          >
            {errorMessage ? (
              <p className="error-message">{errorMessage}</p>
            ) : properties.length > 0 ? (
              properties.map((property, index) => (
                <motion.div
                  key={property._id}
                  className="property-card"
                  onClick={() => router.push(`/property/${property._id}`)}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { 
                      opacity: 1, 
                      y: 0,
                      transition: {
                        duration: 0.5
                      }
                    }
                  }}
                  whileHover={{ 
                    y: -10,
                    transition: { duration: 0.2 }
                  }}
                >
                  <div className="property-image-container">
                    <div className="property-badges">
                      <span className="badge bhk-badge">{property.bhk} BHK</span>
                      <span className="badge furnishing-badge">{property.furnishingStatus}</span>
                    </div>
                    <div className="property-image">
                      <img 
                        src={getRandomImage(index)}
                        alt={`${property.bhk} BHK in ${property.areaLocality}`}
                        loading="lazy"
                      />
                    </div>
                  </div>
                  <div className="property-details">
                    <h3>{property.bhk} BHK in {property.areaLocality}</h3>
                    <div className="property-info">
                      <span className="location">
                        <i className="fas fa-map-marker-alt"></i> {property.city}
                      </span>
                      <span className="tenant-type">{property.tenantPreferred}</span>
                    </div>
                    <div className="property-specs">
                      <span className="area">
                        <i className="fas fa-home"></i> {property.areaType} | {property.size} sq.ft
                      </span>
                      <span className="rent">₹{property.rent.toLocaleString('en-IN')}/month</span>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.p 
                className="no-properties"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                No properties available matching your criteria.
              </motion.p>
            )}
          </motion.div>
        )}
      </div>
      <Footer />
      <style jsx>{`
        .properties-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #1e293b, #0f172a);
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
        }
        .page-title {
          font-size: 32px;
          color: #fff;
          margin-bottom: 30px;
          text-align: center;
        }
        .filters-form {
          background: rgba(255, 255, 255, 0.1);
          padding: 20px;
          border-radius: 12px;
          margin-bottom: 30px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .filters-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          align-items: end;
        }
        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .filter-group label {
          color: #e2e8f0;
          font-size: 14px;
          font-weight: 500;
        }
        .filter-group input,
        .filter-group select {
          padding: 12px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
          font-size: 16px;
          transition: all 0.3s ease;
        }
        .filter-group input:focus,
        .filter-group select:focus {
          border-color: #3b82f6;
          background: rgba(255, 255, 255, 0.15);
          outline: none;
        }
        .filter-button {
          background: #3b82f6;
          color: white;
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .filter-button:hover {
          background: #2563eb;
          transform: translateY(-2px);
        }
        .button-icon {
          font-size: 18px;
        }
        .loading-spinner {
          text-align: center;
          color: #e2e8f0;
          padding: 60px;
        }
        .spinner {
          width: 50px;
          height: 50px;
          border: 4px solid rgba(255, 255, 255, 0.1);
          border-left-color: #3b82f6;
          border-radius: 50%;
          margin: 0 auto 20px;
          animation: spin 1s linear infinite;
        }
        .property-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 30px;
        }
        .property-card {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          overflow: hidden;
          cursor: pointer;
          border: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
        }
        .property-image-container {
          position: relative;
        }
        .property-badges {
          position: absolute;
          top: 12px;
          left: 12px;
          z-index: 2;
          display: flex;
          gap: 8px;
        }
        .badge {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          backdrop-filter: blur(4px);
        }
        .bhk-badge {
          background: rgba(59, 130, 246, 0.8);
          color: white;
        }
        .furnishing-badge {
          background: rgba(16, 185, 129, 0.8);
          color: white;
        }
        .property-image {
          height: 220px;
          overflow: hidden;
          position: relative;
        }
        .property-image::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(0deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 50%);
        }
        .property-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s ease;
        }
        .property-card:hover .property-image img {
          transform: scale(1.1);
        }
        .property-details {
          padding: 20px;
        }
        .property-details h3 {
          color: #fff;
          font-size: 18px;
          margin-bottom: 12px;
          line-height: 1.4;
        }
        .property-info {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 15px;
        }
        .property-info span {
          font-size: 14px;
          color: #94a3b8;
          padding: 4px 12px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .property-specs {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: 15px;
          margin-top: 15px;
        }
        .area {
          color: #94a3b8;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .rent {
          color: #60a5fa;
          font-weight: 600;
          font-size: 18px;
          background: rgba(96, 165, 250, 0.1);
          padding: 6px 12px;
          border-radius: 8px;
        }
        .error-message {
          color: #ef4444;
          text-align: center;
          padding: 20px;
          background: rgba(239, 68, 68, 0.1);
          border-radius: 8px;
          backdrop-filter: blur(10px);
        }
        .no-properties {
          color: #94a3b8;
          text-align: center;
          padding: 40px;
          grid-column: 1 / -1;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          backdrop-filter: blur(10px);
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        @media (max-width: 768px) {
          .container {
            padding: 20px;
          }
          .filters-grid {
            grid-template-columns: 1fr;
          }
          .property-grid {
            grid-template-columns: 1fr;
          }
          .property-image {
            height: 180px;
          }
        }
      `}</style>
    </div>
  );
}
