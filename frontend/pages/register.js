import { useState } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = (e) => {
    e.preventDefault();
    alert("Registration Successful! (Backend Needed)");
  };

  return (
    <div>
      <Navbar />
      <div className="auth-container">
        <div className="auth-box">
          <h2>Create Account</h2>
          <p className="subtext">Join us and start renting today</p>
          <form onSubmit={handleRegister}>
            <div className="input-group">
              <label>Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="input-group">
              <label>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="auth-btn">Sign Up</button>
          </form>
          <p className="switch">Already have an account? <Link href="/login">Login</Link></p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
