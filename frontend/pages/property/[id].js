import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function PropertyDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [property, setProperty] = useState(null);

  useEffect(() => {
    if (id) {
      axios.get(`http://localhost:5000/api/properties/${id}`)
        .then(response => setProperty(response.data))
        .catch(error => console.error("Error fetching property", error));
    }
  }, [id]);

  if (!property) return <p>Loading...</p>;

  return (
    <div>
      <Navbar />
      <div className="container mx-auto p-4">
        <img src={property.image} alt={property.title} className="w-full h-60 object-cover rounded-md" />
        <h1 className="text-3xl font-bold mt-4">{property.title}</h1>
        <p className="text-gray-600">{property.location}</p>
        <p className="text-xl font-bold">₹{property.price}/month</p>
      </div>
      <Footer />
    </div>
  );
}
