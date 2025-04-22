import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import { AuthContext } from '../_app';
import LandlordSidebar from '../../components/LandlordSidebar';
import MaintenanceCard from '../../components/MaintenanceCard';
import { toast } from 'react-toastify';
import styles from '../../styles/landlordMaintenance.module.css';

const Maintenance = () => {
    const { user } = useContext(AuthContext);
    const router = useRouter();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all');
    const [sortBy, setSortBy] = useState('date');

    useEffect(() => {
        if (!user || user.role !== 'landlord') {
            router.push('/login');
            return;
        }
        fetchRequests();
    }, [user]);

    const fetchRequests = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/landlord/${user.id}/maintenance-requests`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch maintenance requests');

            const data = await response.json();
            setRequests(data);
        } catch (err) {
            console.error('Failed to fetch maintenance requests:', err);
            setError('Failed to load maintenance requests. Please try again.');
            toast.error('Failed to load maintenance requests');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (requestId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/maintenance/${requestId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) throw new Error('Failed to update status');

            await fetchRequests();
            toast.success('Status updated successfully');
        } catch (err) {
            console.error('Failed to update status:', err);
            toast.error('Failed to update status');
        }
    };

    const filteredAndSortedRequests = [...requests]
        .filter(req => {
            if (filter === 'all') return true;
            return req.status.toLowerCase() === filter;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'date':
                    return new Date(b.requestDate) - new Date(a.requestDate);
                case 'priority':
                    const priorityOrder = { emergency: 0, high: 1, medium: 2, low: 3 };
                    return priorityOrder[a.priority.toLowerCase()] - priorityOrder[b.priority.toLowerCase()];
                default:
                    return 0;
            }
        });

    if (loading) return <div className={styles.loading}>Loading...</div>;
    if (error) return <div className={styles.error}>{error}</div>;

    return (
        <div className={styles.maintenanceContainer}>
            <LandlordSidebar />
            <main className={styles.mainContent}>
                <div className={styles.header}>
                    <h1>Maintenance Requests</h1>
                    <div className={styles.controls}>
                        <div className={styles.filterGroup}>
                            <label>Filter by Status:</label>
                            <select 
                                value={filter} 
                                onChange={(e) => setFilter(e.target.value)}
                                className={styles.select}
                            >
                                <option value="all">All Requests</option>
                                <option value="pending">Pending</option>
                                <option value="in progress">In Progress</option>
                                <option value="resolved">Resolved</option>
                            </select>
                        </div>

                        <div className={styles.filterGroup}>
                            <label>Sort by:</label>
                            <select 
                                value={sortBy} 
                                onChange={(e) => setSortBy(e.target.value)}
                                className={styles.select}
                            >
                                <option value="date">Date</option>
                                <option value="priority">Priority</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className={styles.requestsGrid}>
                    {filteredAndSortedRequests.length > 0 ? (
                        filteredAndSortedRequests.map(request => (
                            <MaintenanceCard
                                key={request._id}
                                request={request}
                                onUpdateStatus={handleUpdateStatus}
                            />
                        ))
                    ) : (
                        <div className={styles.noRequests}>
                            <p>No {filter !== 'all' ? filter : ''} maintenance requests found.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Maintenance;