import React from "react";
// import styles from "../styles/whoweare.module.css";
import { FaShieldAlt, FaSearch, FaRupeeSign, FaHome } from "react-icons/fa";

const WhoWeAre = () => {
  const benefits = [
    { title: "100% Verified Properties", description: "No fake listings! Every property is manually verified to ensure security & transparency.", icon: <FaShieldAlt /> },
    { title: "Smart Property Search", description: "Find the perfect rental with AI-powered recommendations, real-time availability & advanced filters.", icon: <FaSearch /> },
    { title: "Affordable & No Hidden Fees", description: "We ensure transparent pricing with zero brokerage & hidden costs for an easy renting process.", icon: <FaRupeeSign /> },
    { title: "Seamless Move-In Process", description: "From virtual tours to online rental agreements, move in faster with digital transactions & support.", icon: <FaHome /> }
  ];

  return (
    <section className="who-we-are">
      <h2>Why Choose Us?</h2>
      <p>We redefine renting with trusted listings, secure transactions, and hassle-free moving.</p>
      <div className="who-we-are-grid">
        {benefits.map((item, index) => (
          <div key={index} className="who-card">
            <div className="who-icon">{item.icon}</div>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WhoWeAre;
