// pages/_app.js
import React, { createContext, useState, useEffect } from "react";
import "../styles/global.css";
import "../styles/auth.css";

export const AuthContext = createContext(null);

export default function App({ Component, pageProps }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch (err) {
          console.error("❌ Could not parse stored user:", err);
        }
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <Component {...pageProps} />
    </AuthContext.Provider>
  );
}
