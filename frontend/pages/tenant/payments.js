// ✅ tenant/payments.js
import { useEffect, useState } from "react";
import TenantSidebar from "../../components/TenantSidebar";
import styles from "../../styles/tenantPayments.module.css";

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState("");
  const [tenantId, setTenantId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload?.id) {
          setTenantId(payload.id);
        } else {
          setError("Tenant ID not found in token.");
          setLoading(false);
        }
      } catch (err) {
        console.error("Token decode error:", err);
        setError("Invalid token.");
        setLoading(false);
      }
    } else {
      setError("No token found.");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!tenantId) return;

    const fetchPayments = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/tenant/payments/${tenantId}`);
        const data = await res.json();

        if (res.ok) {
          setPayments(data);
        } else {
          setError(data.message || "Failed to load payments.");
        }
      } catch (err) {
        console.error("Payment fetch error:", err);
        setError("Error fetching payments.");
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [tenantId]);

  return (
    <div className={styles.pageContainer}>
      <TenantSidebar />
      <main className={styles.mainContent}>
        <h1 className={styles.pageTitle}>Payments</h1>
        <p className={styles.pageSubtitle}>View and manage your rental payments.</p>

        {loading ? (
          <p className={styles.pageSubtitle}>Loading payments...</p>
        ) : error ? (
          <p className="text-red-500 font-semibold">{error}</p>
        ) : payments.length > 0 ? (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Amount</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Method</th>
                  <th>Date Paid</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p._id}>
                    <td>₹{p.amount}</td>
                    <td>{p.dueDate ? new Date(p.dueDate).toLocaleDateString() : "—"}</td>
                    <td className={
                      p.status === "Paid" ? styles.statusPaid : styles.statusPending
                    }>
                      {p.status}
                    </td>
                    <td>{p.method || "N/A"}</td>
                    <td>{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className={styles.noPayments}>No payments found.</p>
        )}
      </main>
    </div>
  );
};

export default Payments;