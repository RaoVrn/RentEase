import { useEffect, useState } from "react";
import LandlordSidebar from "../../components/LandlordSidebar";
import styles from "../../styles/landlordPayments.module.css";
import axios from "axios";
import { useRouter } from "next/router";

export default function LandlordPayments() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [user, setUser] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
            return;
        }

        // Get user data from token
        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            setUser(payload);

            const fetchPayments = async () => {
                try {
                    const response = await axios.get(
                        `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'}/api/landlord/${payload.id}/payments`,
                        {
                            headers: {
                                "Authorization": `Bearer ${token}`
                            }
                        }
                    );

                    if (response.data && Array.isArray(response.data.payments)) {
                        setPayments(response.data.payments);
                    } else {
                        setPayments([]);
                    }
                } catch (err) {
                    console.error("Failed to fetch payments:", err);
                    if (err.response?.status === 401 || err.response?.status === 403) {
                        router.push("/login");
                        return;
                    }
                    setError(err.response?.data?.message || "Failed to load payments. Please try again.");
                } finally {
                    setLoading(false);
                }
            };

            fetchPayments();
        } catch (err) {
            console.error("Token parse error:", err);
            router.push("/login");
        }
    }, [router]);

    if (loading) return (
        <div className={styles.pageContainer}>
            <LandlordSidebar />
            <div className={styles.mainContent}>
                <div className={styles.loading}>Loading...</div>
            </div>
        </div>
    );

    if (error) return (
        <div className={styles.pageContainer}>
            <LandlordSidebar />
            <div className={styles.mainContent}>
                <div className={styles.error}>{error}</div>
            </div>
        </div>
    );

    return (
        <div className={styles.pageContainer}>
            <LandlordSidebar />
            <main className={styles.mainContent}>
                <div className={styles.header}>
                    <h1>Payment History</h1>
                </div>

                {payments.length > 0 ? (
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Property</th>
                                    <th>Tenant</th>
                                    <th>Amount</th>
                                    <th>Due Date</th>
                                    <th>Status</th>
                                    <th>Payment Method</th>
                                    <th>Payment Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.map((payment) => (
                                    <tr key={payment._id}>
                                        <td>{payment.propertyId?.name || "—"}</td>
                                        <td>{payment.tenantId?.name || "—"}</td>
                                        <td>₹{payment.amount}</td>
                                        <td>{payment.dueDate ? new Date(payment.dueDate).toLocaleDateString() : "—"}</td>
                                        <td className={styles[`status${payment.status}`]}>
                                            {payment.status}
                                        </td>
                                        <td>{payment.method || "N/A"}</td>
                                        <td>{payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : "—"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className={styles.noPayments}>
                        <p>No payments found.</p>
                    </div>
                )}
            </main>
        </div>
    );
}