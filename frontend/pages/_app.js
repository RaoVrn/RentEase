import { useState, useEffect, createContext } from "react";
import "../styles/global.css";
import "../styles/auth.css";
import "rc-slider/assets/index.css";

export const AuthContext = createContext(null);

export default function App({ Component, pageProps }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <Component {...pageProps} />
    </AuthContext.Provider>
  );
}
