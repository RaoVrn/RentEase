import { useState, useContext } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { AuthContext } from "../pages/_app";

export default function Login() {
  const { setUser } = useContext(AuthContext);
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("tenant");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await response.json();

      if (response.ok) {
        const user = data.user;

        // Save token + user in localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(user));
        setUser(user);

        // Save tenantId and propertyId if valid
        if (user.id?.length === 24) {
          localStorage.setItem("tenantId", user.id);
        }

        if (user.propertyId?.length === 24) {
          localStorage.setItem("propertyId", user.propertyId);
        }

        // Clear form state
        setEmail("");
        setPassword("");
        setRole("tenant");

        // Redirect based on role
        if (role === "tenant") {
          router.push("/tenant");
        } else {
          router.push("/landlord");
        }
      } else {
        setErrorMessage(data.message || "❌ Login failed. Please try again.");
      }
    } catch (error) {
      console.error("❌ Login Error:", error);
      setErrorMessage("❌ An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="auth-container">
        <div className="auth-box">
          <h2>Welcome Back</h2>
          <p className="subtext">Enter your credentials to access your account</p>

          {errorMessage && <p className="error-message">{errorMessage}</p>}

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
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="eye-icon"
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </button>
            </div>

            <div className="input-group">
              <label>Login as</label>
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
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="switch">
            Don't have an account? <Link href="/register">Sign Up</Link>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
