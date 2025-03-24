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

    // ✅ Fetch tenantId from token in localStorage
    useEffect(() => {
        if (typeof window !== "undefined") {
            const token = localStorage.getItem("token");
            if (token) {
                try {
                    const payload = JSON.parse(atob(token.split(".")[1])); // Decode JWT
                    setTenantId(payload.id); // ✅ Get `id` (tenant ID) from token
                } catch (error) {
                    console.error("Invalid token:", error);
                    setError("Invalid authentication. Please log in again.");
                }
            }
        }
    }, []);

    useEffect(() => {
        const activeTenantId = paramTenantId || tenantId;

        if (!activeTenantId) {
            setError("Tenant ID not found. Please log in.");
            return;
        }

        import("socket.io-client").then(({ io }) => {
            const newSocket = io("http://localhost:5000");
            setSocket(newSocket);

            newSocket.emit("getApplications", activeTenantId);

            newSocket.on("applicationsData", (data) => {
                setApplications(data);
            });

            return () => newSocket.off("applicationsData");
        });
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
