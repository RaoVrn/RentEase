import React from "react";
// import styles from "../styles/hero.module.css";
import SearchBar from "./SearchBar";

const HeroSection = () => {
  return (
    <section className="hero">
      <div className="hero-overlay"></div>
      <div className="hero-content">
        <h1>Find Your Dream Rental</h1>
        <p>Discover verified houses, flats, and PGs for rent.</p>
        <SearchBar />
      </div>
    </section>
  );
};

export default HeroSection;
