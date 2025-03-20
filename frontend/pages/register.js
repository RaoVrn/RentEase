import { useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("tenant"); // ✅ Default role is "tenant"
  const [phone, setPhone] = useState(""); // ✅ Optional phone field
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // ✅ Validate phone number format (Only digits, 10-15 characters)
  const isValidPhone = (phone) => /^[0-9]{10,15}$/.test(phone);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(""); // ✅ Clear previous errors

    // ✅ Validate phone number (if provided)
    if (phone && !isValidPhone(phone)) {
      setLoading(false);
      setErrorMessage("❌ Phone number must be between 10-15 digits.");
      return;
    }

    // ✅ Ensure role is always sent in lowercase
    const userData = { 
      name, 
      email, 
      password, 
      role: role.toLowerCase() || "tenant",  // ✅ Ensure role is always sent
      phone: phone || null  // ✅ Ensure phone is included
    };
    
    console.log("📌 Sending Data to Backend:", userData); // ✅ Debugging

    try {
      const response = await fetch("http://localhost:5000/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      console.log("📌 Server Response:", data); // ✅ Debugging

      if (response.ok) {
        alert("✅ Registration Successful! You can now log in.");
        window.location.href = "/login"; // ✅ Redirect to login page
      } else {
        setErrorMessage("❌ Registration Failed: " + data.message);
      }
    } catch (error) {
      console.error("❌ Registration Error:", error);
      setErrorMessage("❌ An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }; // ✅ Function properly closed

  return (
    <div>
      <Navbar />
      <div className="auth-container">
        <div className="auth-box">
          <h2>Create Account</h2>
          <p className="subtext">Join us and start renting today</p>
          
          {/* ✅ Display error messages */}
          {errorMessage && <p className="error-message">{errorMessage}</p>} 

          <form onSubmit={handleRegister}>
            <div className="input-group">
              <label>Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="input-group password-group">
              <label>Password</label>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="eye-icon"
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </button>
            </div>

            <div className="input-group">
              <label>Phone (Optional)</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone number"
              />
            </div>

            <div className="input-group">
              <label>Register as</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              >
                <option value="tenant">Tenant</option>
                <option value="landlord">Landlord</option>
              </select>
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? "Registering..." : "Sign Up"}
            </button>
          </form>

          <p className="switch">
            Already have an account? <Link href="/login">Login</Link>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
