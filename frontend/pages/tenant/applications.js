import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import TenantSidebar from "../../components/TenantSidebar";
import styles from "../../styles/tenantApplications.module.css";

const Applications = () => {
  const router = useRouter();
  const { tenantId: paramTenantId } = router.query;

  const [applications, setApplications] = useState([]);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);
  const [tenantId, setTenantId] = useState(null);

  // ✅ Get tenantId from JWT token
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          console.log("Decoded JWT Payload:", payload);

          if (payload?.id) {
            setTenantId(payload.id);
          } else {
            setError("Tenant ID not found in token.");
          }
        } catch (err) {
          console.error("Token decoding error:", err);
          setError("Invalid token. Please log in again.");
        }
      } else {
        setError("No authentication token found. Please log in.");
      }
    }
  }, []);

  // ✅ Connect to socket only after tenantId is available
  useEffect(() => {
    const activeTenantId = paramTenantId || tenantId;

    if (!activeTenantId) return;

    let newSocket;

    import("socket.io-client").then(({ io }) => {
      newSocket = io("http://localhost:5000");
      setSocket(newSocket);

      newSocket.emit("getApplications", activeTenantId);

      newSocket.on("applicationsData", (data) => {
        setApplications(data);
      });

      newSocket.on("connect_error", (err) => {
        console.error("Socket connection error:", err);
        setError("Unable to connect to server.");
      });
    });

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [paramTenantId, tenantId]);

  return (
    <div className={styles.applicationsContainer}>
      <TenantSidebar />
      <main className={styles.mainContent}>
        <h1 className={styles.title}>My Applications</h1>
        <p className={styles.description}>Track your rental applications in real-time.</p>

        {error ? (
          <p className={styles.description} style={{ color: "red" }}>{error}</p>
        ) : applications.length > 0 ? (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Status</th>
                  <th>Date Applied</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app._id} className={styles.tableRow}>
                    <td>{app.propertyId?.name || "Unknown Property"}</td>
                    <td>
                      <span className={`${styles.status} ${
                        app.status === "Approved"
                          ? styles.approved
                          : app.status === "Pending"
                          ? styles.pending
                          : styles.rejected
                      }`}>
                        {app.status}
                      </span>
                    </td>
                    <td>{new Date(app.date_applied).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className={styles.noApplications}>No applications found.</p>
        )}
      </main>
    </div>
  );
};

export default Applications;
