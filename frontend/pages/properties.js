import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function PropertiesPage() {
  const router = useRouter();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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
        params: router.query,
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

  return (
    <div>
      <Navbar />
      <div className="container">
        <h2>Available Properties</h2>
        {loading ? (
          <p>Loading properties...</p>
        ) : (
          <div className="property-list">
            {errorMessage ? (
              <p>{errorMessage}</p>
            ) : properties.length > 0 ? (
              properties.map((property) => (
                <div key={property._id} className="property-card">
                  <h3>{property.bhk} BHK in {property.areaLocality}</h3>
                  <p>{property.city}</p>
                  <p>{property.furnishingStatus} | {property.tenantPreferred}</p>
                  <p>{property.areaType} | {property.size} sq.ft</p>
                  <p>₹{property.rent}/month</p>
                </div>
              ))
            ) : (
              <p>No properties available.</p>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
