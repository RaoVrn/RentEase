import { useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("tenant");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    console.log("📌 Sending Login Request:", { email, password, role }); // ✅ Debugging
  
    const response = await fetch("http://localhost:5000/api/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role }),
    });
  
    const data = await response.json();
    console.log("📌 Server Response:", data); // ✅ Debugging
  
    if (response.ok) {
      alert(`✅ Login Successful! Welcome ${role}`);
      localStorage.setItem("user", JSON.stringify(data));
    } else {
      alert("❌ Login Failed: " + data.message);
    }
  };
  

  return (
    <div>
      <Navbar />
      <div className="auth-container">
        <div className="auth-box">
          <h2>Welcome Back</h2>
          <p className="subtext">Enter your credentials to access your account</p>
          <form onSubmit={handleLogin}>
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
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="eye-icon">
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </button>
            </div>
            <div className="input-group">
              <label>Login as</label>
              <select value={role} onChange={(e) => setRole(e.target.value)} required>
                <option value="tenant">Tenant</option>
                <option value="landlord">Landlord</option>
              </select>
            </div>
            <button type="submit" className="auth-btn">Login</button>
          </form>
          <p className="switch">Don't have an account? <Link href="/register">Sign Up</Link></p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
