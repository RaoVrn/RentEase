import { useState } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    alert("Login Successful! (Backend Needed)");
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
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
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
