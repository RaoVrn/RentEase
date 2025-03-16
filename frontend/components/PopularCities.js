import React from "react";
// import styles from "../styles/popularcities.module.css";

const PopularCities = () => {
  const cities = [
    { name: "Mumbai", img: "/images/popularCities/mumbai.jpg" },
    { name: "Delhi", img: "/images/popularCities/delhi1.jpg" },
    { name: "Hyderabad", img: "/images/popularCities/hyderabad.jpg" },
    { name: "Chennai", img: "/images/popularCities/chennai.jpg" },
    { name: "Kolkata", img: "/images/popularCities/kolkata1.jpg" },
    { name: "Bangalore", img: "/images/popularCities/banglore1.jpg" }
  ];

  return (
    <section className="popular-cities">
      <h2>Popular Cities</h2>
      <div className="city-grid">
        {cities.map((city, index) => (
          <div key={index} className="city-card">
            <img src={city.img} alt={city.name} />
            <h3>{city.name}</h3>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PopularCities;
