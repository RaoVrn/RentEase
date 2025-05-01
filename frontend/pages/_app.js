// pages/_app.js
import React, { createContext, useState, useEffect } from "react";
import { useRouter } from "next/router";
import "../styles/global.css";
import "../styles/auth.css";

export const AuthContext = createContext(null);

// Protected routes configuration
const protectedRoutes = {
  "/landlord": "landlord",
  "/landlord/applications": "landlord",
  "/landlord/maintenance": "landlord",
  "/landlord/messages": "landlord",
  "/landlord/payments": "landlord",
  "/landlord/profile": "landlord",
  "/landlord/properties": "landlord",
  "/tenant": "tenant",
  "/tenant/applications": "tenant",
  "/tenant/maintenance": "tenant",
  "/tenant/messages": "tenant",
  "/tenant/payments": "tenant",
  "/tenant/profile": "tenant"
};

export default function App({ Component, pageProps }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = () => {
      try {
        // Check localStorage for user data
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        }
      } catch (err) {
        console.error("❌ Could not parse stored user:", err);
        // Clear invalid data
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  useEffect(() => {
    // Only run after initial auth check
    if (loading) return;

    const path = router.pathname;
    const requiredRole = protectedRoutes[path];

    // If this is a protected route
    if (requiredRole) {
      const storedUser = localStorage.getItem("user");
      
      // No user data found, redirect to login
      if (!storedUser) {
        router.push("/login");
        return;
      }

      try {
        const userData = JSON.parse(storedUser);
        // Wrong role, redirect to login
        if (userData.role !== requiredRole) {
          router.push("/login");
        }
      } catch (err) {
        console.error("❌ Could not parse stored user:", err);
        router.push("/login");
      }
    }
  }, [loading, router.pathname]);

  // Show styled loading indicator while checking auth
  if (loading) {
    return (
      <div style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f9fafb"
      }}>
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1rem"
        }}>
          <div style={{
            width: "40px",
            height: "40px",
            border: "3px solid #e5e7eb",
            borderTop: "3px solid #3b82f6",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }} />
          <p style={{
            color: "#4b5563",
            fontSize: "0.875rem"
          }}>Loading RentEase...</p>
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <Component {...pageProps} />
    </AuthContext.Provider>
  );
}
