import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import LandlordSidebar from '../../components/LandlordSidebar';
import AddPropertyModal from '../../components/AddPropertyModal';
import styles from '../../styles/landlordProperties.module.css';

export default function LandlordProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    const fetchUserAndProperties = async () => {
      try {
        // Get user data from token
        const userResponse = await axios.get('http://localhost:5000/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(userResponse.data);

        // Fetch properties for this landlord
        const propertiesResponse = await axios.get(
          `http://localhost:5000/api/properties/landlord/${userResponse.data._id}/properties`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setProperties(propertiesResponse.data);
        setLoading(false);
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to load properties');
        setLoading(false);
      }
    };

    fetchUserAndProperties();
  }, []);

  const handleAddProperty = async (propertyData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:5000/api/properties/landlord/${user._id}/property`,
        propertyData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setProperties([...properties, response.data]);
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error adding property:', err);
      setError('Failed to add property');
    }
  };

  const handleDeleteProperty = async (propertyId) => {
    const token = localStorage.getItem('token');
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        await axios.delete(`http://localhost:5000/api/properties/landlord/property/${propertyId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Refresh properties list
        const userResponse = await axios.get('http://localhost:5000/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const propertiesResponse = await axios.get(
          `http://localhost:5000/api/properties/landlord/${userResponse.data._id}/properties`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setProperties(propertiesResponse.data);
      } catch (error) {
        console.error('Error deleting property:', error);
        setError('Failed to delete property');
      }
    }
  };

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <LandlordSidebar />
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <LandlordSidebar />
      <main className={styles.mainContent}>
        <div className={styles.header}>
          <h1>My Properties</h1>
          <button
            className={styles.addButton}
            onClick={() => setIsModalOpen(true)}
          >
            Add New Property
          </button>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.propertiesGrid}>
          {properties.length > 0 ? (
            properties.map((property) => (
              <motion.div
                key={property._id}
                className={styles.propertyCard}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className={styles.propertyImage}>
                  <img
                    src={property.image || '/images/featuredProperties/property1.jpg'}
                    alt={`${property.bhk} BHK in ${property.areaLocality}`}
                  />
                </div>
                <div className={styles.propertyDetails}>
                  <h3>{property.bhk} BHK in {property.areaLocality}</h3>
                  <div className={styles.propertyInfo}>
                    <span>{property.city}</span>
                    <span>{property.furnishingStatus}</span>
                  </div>
                  <div className={styles.propertySpecs}>
                    <span>{property.size} sq.ft</span>
                    <span className={styles.rent}>₹{property.rent}/month</span>
                  </div>
                  <div className={styles.actions}>
                    <button 
                      onClick={() => handleDeleteProperty(property._id)}
                      className={styles.deleteBtn}>
                      Delete Property
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className={styles.noProperties}>
              <p>You haven't added any properties yet.</p>
              <button
                className={styles.addButton}
                onClick={() => setIsModalOpen(true)}
              >
                Add Your First Property
              </button>
            </div>
          )}
        </div>

        <AddPropertyModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleAddProperty}
          landlordId={user?._id}
        />
      </main>
    </div>
  );
}