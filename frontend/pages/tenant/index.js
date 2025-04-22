import { useEffect, useState, useContext } from "react";
import TenantSidebar from "../../components/TenantSidebar";
import { AuthContext } from "../_app";
import { useRouter } from "next/router";
import { FaFileInvoiceDollar, FaTools, FaClipboardList } from "react-icons/fa";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import styles from "../../styles/tenantDashboard.module.css";

const TenantDashboard = () => {
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const [applications, setApplications] = useState([]);
  const [payments, setPayments] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    const tenantId = user?._id;

    if (!tenantId) {
      console.warn("🚨 No tenantId available — skipping fetch");
      return;
    }

    async function fetchData() {
      try {
        const [appRes, payRes, maintRes] = await Promise.all([
          fetch(`/api/applications/${tenantId}`).then((res) => res.json()),
          fetch(`/api/payments/${tenantId}`).then((res) => res.json()),
          fetch(`/api/maintenance/${tenantId}`).then((res) => res.json()),
        ]);

        setApplications(Array.isArray(appRes) ? appRes : []);
        setPayments(Array.isArray(payRes) ? payRes : []);
        setMaintenance(Array.isArray(maintRes) ? maintRes : []);
      } catch (error) {
        console.error("❌ Error fetching tenant dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user]);

  return (
    <div className={styles.tenantDashboard}>
      <TenantSidebar />
      <main className={styles.mainContent}>
        <h1 className={styles.header}>
          Welcome, {user?.name || "Tenant"} 👋
        </h1>
        <p className={styles.description}>
          Manage your applications, payments, and maintenance requests here.
        </p>

        {/* Dashboard Cards */}
        <div className={styles.dashboardCards}>
          <motion.div className={styles.dashboardCard} whileHover={{ scale: 1.05 }}>
            <FaClipboardList
              className={styles.dashboardCardIcon}
              style={{ color: "#3b82f6" }}
            />
            <div>
              <h2 className={styles.dashboardCardText}>
                {applications.length}
              </h2>
              <p className={styles.dashboardCardSubtext}>Applications</p>
            </div>
          </motion.div>

          <motion.div className={styles.dashboardCard} whileHover={{ scale: 1.05 }}>
            <FaFileInvoiceDollar
              className={styles.dashboardCardIcon}
              style={{ color: "#10b981" }}
            />
            <div>
              <h2 className={styles.dashboardCardText}>
                {payments.length}
              </h2>
              <p className={styles.dashboardCardSubtext}>Payments</p>
            </div>
          </motion.div>

          <motion.div className={styles.dashboardCard} whileHover={{ scale: 1.05 }}>
            <FaTools
              className={styles.dashboardCardIcon}
              style={{ color: "#f43f5e" }}
            />
            <div>
              <h2 className={styles.dashboardCardText}>
                {maintenance.length}
              </h2>
              <p className={styles.dashboardCardSubtext}>Maintenance Requests</p>
            </div>
          </motion.div>
        </div>

        {/* Payment History Chart */}
        <h2 className={styles.chartTitle}>Payment History</h2>
        <div className={styles.chartContainer}>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={payments}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="amount" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </main>
    </div>
  );
};

export default TenantDashboard;
