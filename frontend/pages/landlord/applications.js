import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import { AuthContext } from '../_app';
import LandlordSidebar from '../../components/LandlordSidebar';
import ApplicationCard from '../../components/ApplicationCard';
import { toast } from 'react-toastify';
import styles from '../../styles/landlordApplications.module.css';

const Applications = () => {
    const { user } = useContext(AuthContext);
    const router = useRouter();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        if (!user || user.role !== 'landlord') {
            router.push('/login');
            return;
        }
        fetchApplications();
    }, [user]);

    const fetchApplications = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token || !user?.id) {
                router.push('/login');
                return;
            }

            const response = await fetch(`/api/landlord/${user.id}/applications`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    router.push('/login');
                    return;
                }
                throw new Error(data.message || 'Failed to fetch applications');
            }

            setApplications(data.applications || []);
        } catch (error) {
            console.error('Error fetching applications:', error);
            setError(error.message || 'Failed to fetch applications');
        }
    };

    const handleAccept = async (applicationId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Authentication required');
            }

            const response = await fetch(`/api/tenant/application/${applicationId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: 'Approved' })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to accept application');
            }

            // Update the application in the local state
            setApplications(apps => apps.map(app => 
                app._id === applicationId ? data.application : app
            ));

            toast.success(data.message || 'Application accepted successfully');
        } catch (err) {
            console.error('Failed to accept application:', err);
            toast.error(err.message || 'Failed to accept application');
        }
    };

    const handleReject = async (applicationId) => {
        if (!confirm('Are you sure you want to reject this application?')) return;

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Authentication required');
            }

            const response = await fetch(`/api/tenant/application/${applicationId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: 'Rejected' })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to reject application');
            }

            // Update the application in the local state
            setApplications(apps => apps.map(app => 
                app._id === applicationId ? data.application : app
            ));

            toast.success(data.message || 'Application rejected successfully');
        } catch (err) {
            console.error('Failed to reject application:', err);
            toast.error(err.message || 'Failed to reject application');
        }
    };

    // Filter applications based on status
    const filteredApplications = applications.filter(app => {
        if (filter === 'all') return true;
        return app.status.toLowerCase() === filter;
    });

    if (loading) return (
        <div className={styles.applicationsContainer}>
            <LandlordSidebar />
            <main className={styles.mainContent}>
                <div className={styles.loading}>Loading applications...</div>
            </main>
        </div>
    );

    return (
        <div className={styles.applicationsContainer}>
            <LandlordSidebar />
            <main className={styles.mainContent}>
                <div className={styles.header}>
                    <h1>Rental Applications</h1>
                    <div className={styles.filters}>
                        <button 
                            className={`${styles.filterButton} ${filter === 'all' ? styles.active : ''}`}
                            onClick={() => setFilter('all')}
                        >
                            All
                        </button>
                        <button 
                            className={`${styles.filterButton} ${filter === 'pending' ? styles.active : ''}`}
                            onClick={() => setFilter('pending')}
                        >
                            Pending
                        </button>
                        <button 
                            className={`${styles.filterButton} ${filter === 'approved' ? styles.active : ''}`}
                            onClick={() => setFilter('approved')}
                        >
                            Approved
                        </button>
                        <button 
                            className={`${styles.filterButton} ${filter === 'rejected' ? styles.active : ''}`}
                            onClick={() => setFilter('rejected')}
                        >
                            Rejected
                        </button>
                    </div>
                </div>

                {error ? (
                    <div className={styles.error}>{error}</div>
                ) : (
                    <div className={styles.applicationsGrid}>
                        {filteredApplications.length > 0 ? (
                            filteredApplications.map(application => (
                                <ApplicationCard
                                    key={application._id}
                                    application={application}
                                    onAccept={handleAccept}
                                    onReject={handleReject}
                                />
                            ))
                        ) : (
                            <div className={styles.noApplications}>
                                <p>No {filter !== 'all' ? filter : ''} applications found.</p>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Applications;