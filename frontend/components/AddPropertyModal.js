import { useState, useEffect } from 'react';
import styles from '../styles/addPropertyModal.module.css';

const AddPropertyModal = ({ isOpen, onClose, property = null, onSubmit, landlordId }) => {
    const [formData, setFormData] = useState({
        rent: '',
        bhk: '',
        size: '',
        floor: '',
        areaType: '',
        areaLocality: '',
        city: '',
        furnishingStatus: '',
        tenantPreferred: '',
        bathroom: '',
        pointOfContact: '',
        description: '',
        image: ''
    });

    useEffect(() => {
        if (property) {
            setFormData({
                rent: property.rent || '',
                bhk: property.bhk || '',
                size: property.size || '',
                floor: property.floor || '',
                areaType: property.areaType || '',
                areaLocality: property.areaLocality || '',
                city: property.city || '',
                furnishingStatus: property.furnishingStatus || '',
                tenantPreferred: property.tenantPreferred || '',
                bathroom: property.bathroom || '',
                pointOfContact: property.pointOfContact || '',
                description: property.description || '',
                image: property.image || ''
            });
        }
    }, [property]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        let processedValue = value;
        
        // Convert numeric fields to numbers
        if (['rent', 'bhk', 'size', 'bathroom'].includes(name)) {
            processedValue = value === '' ? '' : Number(value);
        }
        
        setFormData(prev => ({
            ...prev,
            [name]: processedValue
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Add landlordId and postedOn to the form data
        const propertyData = {
            ...formData,
            landlordId,
            postedOn: new Date(),
        };
        onSubmit(propertyData);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modal}>
                <div className={styles.modalHeader}>
                    <h2>{property ? 'Edit Property' : 'Add New Property'}</h2>
                    <button onClick={onClose} className={styles.closeButton}>×</button>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label>BHK *</label>
                            <select
                                name="bhk"
                                value={formData.bhk}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select BHK</option>
                                <option value="1">1 BHK</option>
                                <option value="2">2 BHK</option>
                                <option value="3">3 BHK</option>
                                <option value="4">4+ BHK</option>
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Monthly Rent (₹) *</label>
                            <input
                                type="number"
                                name="rent"
                                value={formData.rent}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Size (sq.ft) *</label>
                            <input
                                type="number"
                                name="size"
                                value={formData.size}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Floor *</label>
                            <input
                                type="text"
                                name="floor"
                                value={formData.floor}
                                onChange={handleChange}
                                placeholder="e.g., Ground, 1st, 2nd"
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Area Type *</label>
                            <select
                                name="areaType"
                                value={formData.areaType}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Area Type</option>
                                <option value="Apartment">Apartment</option>
                                <option value="Independent House">Independent House</option>
                                <option value="Villa">Villa</option>
                                <option value="Studio">Studio</option>
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Area/Locality *</label>
                            <input
                                type="text"
                                name="areaLocality"
                                value={formData.areaLocality}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>City *</label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Furnishing Status *</label>
                            <select
                                name="furnishingStatus"
                                value={formData.furnishingStatus}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Furnishing Status</option>
                                <option value="Unfurnished">Unfurnished</option>
                                <option value="Semi-Furnished">Semi-Furnished</option>
                                <option value="Fully-Furnished">Fully-Furnished</option>
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Tenant Preferred *</label>
                            <select
                                name="tenantPreferred"
                                value={formData.tenantPreferred}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Tenant Type</option>
                                <option value="Family">Family</option>
                                <option value="Bachelor">Bachelor</option>
                                <option value="Any">Any</option>
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Bathrooms *</label>
                            <input
                                type="number"
                                name="bathroom"
                                value={formData.bathroom}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Point of Contact *</label>
                            <input
                                type="text"
                                name="pointOfContact"
                                value={formData.pointOfContact}
                                onChange={handleChange}
                                placeholder="Name and contact number"
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Property Image URL</label>
                            <input
                                type="url"
                                name="image"
                                value={formData.image}
                                onChange={handleChange}
                                placeholder="https://example.com/image.jpg"
                            />
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="4"
                        />
                    </div>

                    <div className={styles.modalActions}>
                        <button type="button" onClick={onClose} className={styles.cancelButton}>
                            Cancel
                        </button>
                        <button type="submit" className={styles.submitButton}>
                            {property ? 'Save Changes' : 'Add Property'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddPropertyModal;