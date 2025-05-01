import React, { useEffect, useState, useContext } from 'react';
import { useRouter } from 'next/router';
import { AuthContext } from '../_app';
import TenantSidebar from '../../components/TenantSidebar';
import styles from '../../styles/tenantMaintenance.module.css';
import { toast } from 'react-toastify';

const Maintenance = () => {
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const [requests, setRequests] = useState([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'Medium'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user?.id) return;
    fetchRequests();
  }, [user?.id]);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/tenant/maintenance/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch requests');

      const data = await response.json();
      setRequests(data);
    } catch (err) {
      console.error('Failed to fetch maintenance requests:', err);
      setError('Failed to load maintenance requests. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!user?.id || !user?.propertyId) {
      setError('User or property information is missing. Please ensure you are properly logged in.');
      return;
    }

    if (!form.title.trim() || !form.description.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const requestData = {
        tenantId: user.id,
        propertyId: user.propertyId,
        title: form.title.trim(),
        description: form.description.trim(),
        priority: form.priority
      };

      const response = await fetch('/api/tenant/maintenance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit request');
      }

      setForm({ title: '', description: '', priority: 'Medium' });
      await fetchRequests();
      toast.success('Maintenance request submitted successfully!');
    } catch (err) {
      console.error('Failed to submit request:', err);
      setError(err.message || 'Failed to submit maintenance request. Please try again.');
      toast.error('Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return '⏳';
      case 'in progress':
        return '🔧';
      case 'resolved':
        return '✅';
      default:
        return '⏳';
    }
  };

  if (!user) return null;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.sidebarWrapper}>
        <TenantSidebar />
      </div>

      <div className={styles.mainContent}>
        <div className={styles.header}>
          <h1>Maintenance Requests</h1>
          <p>Submit and track maintenance issues in your unit</p>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>Issue Title</label>
            <input
              type="text"
              className={styles.input}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Brief description of the issue"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Detailed Description</label>
            <textarea
              className={styles.textarea}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Provide more details about the maintenance issue..."
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Priority Level</label>
            <select
              className={styles.select}
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Emergency">Emergency</option>
            </select>
          </div>

          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>

        <div className={styles.requestsGrid}>
          {requests.length > 0 ? (
            requests.map((request) => (
              <div key={request._id} className={styles.requestCard}>
                <div className={styles.cardHeader}>
                  <h3>{request.title}</h3>
                </div>
                <p className={styles.description}>{request.description}</p>
                <div className={styles.cardFooter}>
                  <div className={styles.statusAndPriority}>
                    <span className={`${styles.status} ${styles[request.status?.toLowerCase()]}`}>
                      {getStatusIcon(request.status)} {request.status}
                    </span>
                    <span className={styles.priority}>🎯 {request.priority}</span>
                  </div>
                  <span className={styles.date}>
                    {new Date(request.requestDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.noRequests}>
              No maintenance requests found. Submit a new request above.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Maintenance;
