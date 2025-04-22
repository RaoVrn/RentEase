import { useEffect, useState, useContext } from "react";
import { useRouter } from "next/router";
import { AuthContext } from "../_app";
import LandlordSidebar from "../../components/LandlordSidebar";
import { FaHome, FaClipboardList, FaDollarSign, FaTools } from "react-icons/fa";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import styles from "../../styles/landlordDashboard.module.css";

const LandlordDashboard = () => {
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState({
    properties: [],
    applications: [],
    payments: [],
    maintenance: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user || user.role !== "landlord") {
      router.push("/login");
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        };

        const [propertiesRes, applicationsRes, paymentsRes, maintenanceRes] = await Promise.all([
          fetch(`/api/landlord/${user.id}/properties`, { headers }),
          fetch(`/api/landlord/${user.id}/applications`, { headers }),
          fetch(`/api/landlord/${user.id}/payments`, { headers }),
          fetch(`/api/landlord/${user.id}/maintenance-requests`, { headers })
        ]);

        const [properties, applications, payments, maintenance] = await Promise.all([
          propertiesRes.json(),
          applicationsRes.json(),
          paymentsRes.json(),
          maintenanceRes.json()
        ]);

        setDashboardData({ properties, applications, payments, maintenance });
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  // Safely calculate total revenue with validation
  const totalRevenue = Array.isArray(dashboardData.payments) 
    ? dashboardData.payments.reduce((sum, payment) => {
        const amount = parseFloat(payment?.amount) || 0;
        return sum + amount;
      }, 0)
    : 0;
  
  // Safely calculate other metrics with validation
  const pendingApplications = Array.isArray(dashboardData.applications)
    ? dashboardData.applications.filter(app => app?.status === "pending").length
    : 0;
    
  const activeMaintenanceRequests = Array.isArray(dashboardData.maintenance)
    ? dashboardData.maintenance.filter(req => req?.status !== "resolved").length
    : 0;

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.dashboardContainer}>
      <LandlordSidebar />
      <main className={styles.mainContent}>
        <h1 className={styles.header}>
          Welcome, {user?.name || "Landlord"} 👋
        </h1>
        <p className={styles.description}>
          Manage your properties, tenants, and maintenance requests from one place.
        </p>

        <div className={styles.statsGrid}>
          <motion.div className={styles.statsCard} whileHover={{ scale: 1.05 }}>
            <FaHome className={styles.statsIcon} />
            <div className={styles.statsInfo}>
              <h3>{dashboardData.properties.length}</h3>
              <p>Properties</p>
            </div>
          </motion.div>

          <motion.div className={styles.statsCard} whileHover={{ scale: 1.05 }}>
            <FaClipboardList className={styles.statsIcon} />
            <div className={styles.statsInfo}>
              <h3>{pendingApplications}</h3>
              <p>Pending Applications</p>
            </div>
          </motion.div>

          <motion.div className={styles.statsCard} whileHover={{ scale: 1.05 }}>
            <FaDollarSign className={styles.statsIcon} />
            <div className={styles.statsInfo}>
              <h3>${totalRevenue.toLocaleString()}</h3>
              <p>Total Revenue</p>
            </div>
          </motion.div>

          <motion.div className={styles.statsCard} whileHover={{ scale: 1.05 }}>
            <FaTools className={styles.statsIcon} />
            <div className={styles.statsInfo}>
              <h3>{activeMaintenanceRequests}</h3>
              <p>Active Maintenance</p>
            </div>
          </motion.div>
        </div>

        <div className={styles.charts}>
          <div className={styles.chartContainer}>
            <h2>Monthly Revenue</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={Array.isArray(dashboardData.payments) ? dashboardData.payments : []}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amount" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={styles.recentActivity}>
          <h2>Recent Activity</h2>
          <div className={styles.activityList}>
            {[
              ...(Array.isArray(dashboardData.applications) ? dashboardData.applications : []),
              ...(Array.isArray(dashboardData.maintenance) ? dashboardData.maintenance : [])
            ]
              .filter(item => item && item.createdAt) // Filter out invalid items
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .slice(0, 5)
              .map((item, index) => (
                <div key={item._id || index} className={styles.activityItem}>
                  <span className={styles.activityIcon}>
                    {item.type === "application" ? "📋" : "🔧"}
                  </span>
                  <div className={styles.activityInfo}>
                    <h4>{item.title || `New ${item.type || 'Activity'}`}</h4>
                    <p>{new Date(item.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={styles.activityStatus}>{item.status || 'Unknown'}</span>
                </div>
              ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandlordDashboard;