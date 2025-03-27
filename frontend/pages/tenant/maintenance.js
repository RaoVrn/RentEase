import { useEffect, useState } from 'react';
import TenantSidebar from '../../components/TenantSidebar';
import styles from '../../styles/tenantMaintenance.module.css';
import { FaCheckCircle, FaHourglassHalf, FaTrash } from 'react-icons/fa';
import axios from 'axios';

const Maintenance = () => {
    const [requests, setRequests] = useState([]);
    const [form, setForm] = useState({ title: '', description: '' });
    const [loading, setLoading] = useState(false);
    const [tenantId, setTenantId] = useState(null);
    const [propertyId, setPropertyId] = useState(null);

    // ✅ Load tenant and property IDs from localStorage safely
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const tid = localStorage.getItem('tenantId');
            const pid = localStorage.getItem('propertyId');
            console.log("💬 From localStorage:", { tid, pid }); // 🔍 Debug log
            if (tid?.length === 24) setTenantId(tid);
            if (pid?.length === 24) setPropertyId(pid);
        }
    }, []);

    // ✅ Fetch all maintenance requests
    const fetchRequests = async (tid) => {
        if (!tid || tid.length !== 24) return;
        try {
            const res = await axios.get(`http://localhost:5000/api/tenant/maintenance/${tid}`);
            setRequests(res.data.reverse());
        } catch (err) {
            console.error('❌ Failed to fetch maintenance requests:', err.response?.data || err.message);
        }
    };

    // ✅ Handle form input change
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // ✅ Handle maintenance request submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!tenantId || !propertyId) return;

        if (!form.title.trim() || !form.description.trim()) {
            alert("Please fill in all fields.");
            return;
        }

        const payload = {
            tenantId,
            propertyId,
            title: form.title,
            description: form.description,
            status: 'Pending',
            date: new Date().toISOString().split('T')[0],
        };

        try {
            setLoading(true);
            console.log("📤 Submitting request:", payload);
            await axios.post('http://localhost:5000/api/tenant/maintenance', payload);
            setForm({ title: '', description: '' });
            await fetchRequests(tenantId);
        } catch (err) {
            console.error('❌ Failed to submit request:', err.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    };

    // ✅ Handle deletion of a maintenance request
    const handleDelete = async (requestId) => {
        if (!requestId || requestId.length !== 24) {
            console.warn("⚠️ Invalid request ID:", requestId);
            return;
        }

        try {
            console.log("🗑️ Deleting request:", requestId);
            await axios.delete(`http://localhost:5000/api/tenant/maintenance/request/${requestId}`);
            setRequests((prev) => prev.filter((r) => r._id !== requestId));
        } catch (err) {
            console.error('❌ Failed to delete request:', err.response?.data || err.message);
        }
    };

    // ✅ Auto fetch requests on tenantId set
    useEffect(() => {
        if (tenantId && tenantId.length === 24) {
            fetchRequests(tenantId);
        }
    }, [tenantId]);

    // ✅ Wait for IDs to load before rendering
    if (!tenantId || !propertyId) {
        return (
            <div className={styles.pageContainer}>
                <TenantSidebar />
                <main className={styles.mainContent}>
                    <h1 className={styles.pageTitle}>Loading...</h1>
                </main>
            </div>
        );
    }

    return (
        <div className={styles.pageContainer}>
            <TenantSidebar />
            <main className={styles.mainContent}>
                <h1 className={styles.pageTitle}>Maintenance Requests</h1>
                <p className={styles.pageSubtitle}>Submit and track issues in your unit seamlessly.</p>

                {/* Request Form */}
                <form onSubmit={handleSubmit} className={styles.form}>
                    <input
                        type="text"
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        placeholder="Enter issue title..."
                        required
                        className={styles.input}
                    />
                    <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        placeholder="Provide detailed description..."
                        required
                        className={styles.textarea}
                    />
                    <button type="submit" className={styles.submitBtn} disabled={loading || !tenantId}>
                        {loading ? 'Submitting...' : '📩 Submit Request'}
                    </button>
                </form>

                {/* Request Cards */}
                <div className={styles.cardGrid}>
                    {requests.length === 0 ? (
                        <p className={styles.pageSubtitle}>No maintenance requests found.</p>
                    ) : (
                        requests.map((req) => (
                            <div key={req._id} className={styles.card}>
                                <div className={styles.cardHeader}>
                                    <h2 className={styles.cardTitle}>{req.title}</h2>
                                    <button
                                        className={styles.deleteBtn}
                                        onClick={() => handleDelete(req._id)}
                                        title="Delete Request"
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                                <p className={styles.cardDesc}>{req.description}</p>
                                <div className={styles.cardFooter}>
                                    <span className={`${styles.status} ${styles[req.status.toLowerCase()]}`}>
                                        {req.status === 'Pending' ? <FaHourglassHalf /> : <FaCheckCircle />}
                                        {req.status}
                                    </span>
                                    <span className={styles.date}>
                                        {req.date || new Date(req.requestDate).toISOString().split('T')[0]}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
};

export default Maintenance;
