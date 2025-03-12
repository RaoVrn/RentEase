import { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Home() {
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/properties")
      .then(response => setProperties(response.data))
      .catch(error => console.error("Error fetching properties", error));
  }, []);

  return (
    <div>
      <Navbar />

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>Find Your Dream Rental</h1>
          <p>Discover verified houses, flats, and PGs for rent.</p>
          <div className="search-bar">
            <select>
              <option>Select City</option>
              <option>Mumbai</option>
              <option>Bangalore</option>
              <option>Delhi</option>
              <option>Pune</option>
            </select>
            <input type="text" placeholder="Search by location, landmark..." />
            <button>Search</button>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <div className="properties">
        <h2>Available Properties</h2>
        <div className="property-list">
          {properties.length > 0 ? properties.map((property) => (
            <div key={property._id} className="property-card">
              <img src={property.image} alt={property.title} />
              <h3>{property.title}</h3>
              <p>{property.location}</p>
              <p>₹{property.price}/month</p>
              <Link href={`/property/${property._id}`}>
                <button>View Details</button>
              </Link>
            </div>
          )) : <p>No properties available at the moment.</p>}
        </div>
      </div>

      <Footer />
    </div>
  );
}
