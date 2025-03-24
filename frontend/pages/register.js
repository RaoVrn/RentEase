import { useState, useContext } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { AuthContext } from "../pages/_app"; // ✅ Importing Global Auth Context

export default function Register() {
  const { setUser } = useContext(AuthContext); // ✅ Access global auth state
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("tenant"); // ✅ Default role: Tenant
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // ✅ Validate email format
  const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

  // ✅ Validate phone number format (10-15 digits)
  const isValidPhone = (phone) => /^[0-9]{10,15}$/.test(phone);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(""); // ✅ Clear previous errors

    // ✅ Input Validations
    if (name.trim().length < 3) {
      setLoading(false);
      setErrorMessage("❌ Name must be at least 3 characters long.");
      return;
    }

    if (!isValidEmail(email)) {
      setLoading(false);
      setErrorMessage("❌ Invalid email format.");
      return;
    }

    if (password.length < 6) {
      setLoading(false);
      setErrorMessage("❌ Password must be at least 6 characters long.");
      return;
    }

    if (phone && !isValidPhone(phone)) {
      setLoading(false);
      setErrorMessage("❌ Phone number must be between 10-15 digits.");
      return;
    }

    // ✅ Prepare user data
    const userData = {
      name,
      email,
      password,
      role: role.toLowerCase() || "tenant", // ✅ Ensure lowercase role
      phone: phone || null,
    };

    console.log("📌 Sending Registration Request:", userData);

    try {
      const response = await fetch("http://localhost:5000/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      console.log("📌 Server Response:", data);

      if (response.ok) {
        alert("✅ Registration Successful! Logging you in...");
        
        // Auto-login after successful registration
        const loginResponse = await fetch("http://localhost:5000/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, role }),
        });

        const loginData = await loginResponse.json();
        if (loginResponse.ok) {
          localStorage.setItem("user", JSON.stringify(loginData));
          setUser(loginData); // ✅ Store user data globally

          // ✅ Redirect based on user role
          if (role === "tenant") {
            router.push("/tenant");
          } else {
            router.push("/landlord-dashboard");
          }
        } else {
          router.push("/login"); // If login fails, redirect to login page
        }
      } else {
        setErrorMessage("❌ Registration Failed: " + data.message);
      }
    } catch (error) {
      console.error("❌ Registration Error:", error);
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
