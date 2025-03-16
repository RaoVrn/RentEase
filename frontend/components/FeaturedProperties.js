import React from "react";
// import styles from "../styles/featured.module.css";

const FeaturedProperties = () => {
  const properties = [
    { name: "Luxury 2 BHK in Mumbai", img: "/images/featuredProperties/property1.jpg", price: "₹80,000/month" },
    { name: "Spacious 3 BHK in Delhi", img: "/images/featuredProperties/property2.jpg", price: "₹48,000/month" },
    { name: "Modern 1 BHK in Bangalore", img: "/images/featuredProperties/property3.jpg", price: "₹32,000/month" },
    { name: "Elegant Villa in Chennai", img: "/images/featuredProperties/property4.jpg", price: "₹75,000/month" },
  ];

  return (
    <section className="featured-properties">
      <h2>Featured Properties</h2>
      <div className="property-grid">
        {properties.map((property, index) => (
          <div key={index} className="property-card">
            <img src={property.img} alt={property.name} />
            <h3>{property.name}</h3>
            <p>{property.price}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturedProperties;
