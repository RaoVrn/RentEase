import React from 'react';
import { FaBed, FaBath, FaRulerCombined } from 'react-icons/fa';
import styles from '../styles/propertyCard.module.css';

const PropertyCard = ({ property, onEdit, onDelete }) => {
    const {
        _id,
        name,
        address,
        rent,
        bedrooms,
        bathrooms,
        squareFeet,
        status,
        imageUrl,
        description
    } = property;

    const getStatusClass = () => {
        switch (status?.toLowerCase()) {
            case 'available':
                return styles.available;
            case 'rented':
                return styles.rented;
            case 'maintenance':
                return styles.maintenance;
            default:
                return '';
        }
    };

    return (
        <div className={styles.propertyCard}>
            <div className={styles.imageContainer}>
                <img
                    src={imageUrl || '/images/property-placeholder.jpg'}
                    alt={name}
                    className={styles.propertyImage}
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/images/property-placeholder.jpg';
                    }}
                />
                <span className={`${styles.statusBadge} ${getStatusClass()}`}>
                    {status}
                </span>
            </div>

            <div className={styles.content}>
                <h3 className={styles.title}>{name}</h3>
                <p className={styles.address}>{address}</p>

                <div className={styles.features}>
                    <div className={styles.feature}>
                        <FaBed />
                        <span>{bedrooms} {bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}</span>
                    </div>
                    <div className={styles.feature}>
                        <FaBath />
                        <span>{bathrooms} {bathrooms === 1 ? 'Bathroom' : 'Bathrooms'}</span>
                    </div>
                    <div className={styles.feature}>
                        <FaRulerCombined />
                        <span>{squareFeet.toLocaleString()} sq ft</span>
                    </div>
                    <div className={styles.feature}>
                        <span className={styles.rentAmount}>${rent.toLocaleString()}/mo</span>
                    </div>
                </div>

                {description && (
                    <p className={styles.description}>
                        {description.length > 150 
                            ? `${description.substring(0, 150)}...` 
                            : description}
                    </p>
                )}

                <div className={styles.actions}>
                    <button
                        onClick={() => onEdit(property)}
                        className={`${styles.button} ${styles.editButton}`}
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => onDelete(_id)}
                        className={`${styles.button} ${styles.deleteButton}`}
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PropertyCard;