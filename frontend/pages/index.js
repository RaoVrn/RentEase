import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import HeroSection from "../components/HeroSection";
import WhoWeAre from "../components/WhoWeAre";
import PopularCities from "../components/PopularCities";
import PriceComparison from "../components/PriceComparison";
import FeaturedProperties from "../components/FeaturedProperties";
import GeminiChat from "../components/GeminiChat";  // Import Gemini Chat component

export default function Home() {
    return (
        <div>
            <Navbar />
            <HeroSection />
            <WhoWeAre />
            <PopularCities />
            <PriceComparison />
            <FeaturedProperties />
            <GeminiChat /> {/* Gemini AI Chat Feature */}
            <Footer />
        </div>
    );
}
