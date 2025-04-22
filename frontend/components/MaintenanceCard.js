import React from 'react';
import styles from '../styles/maintenanceCard.module.css';

const MaintenanceCard = ({ request, onUpdateStatus }) => {
    const {
        title,
        description,
        status,
        priority,
        propertyName,
        tenantName,
        requestDate,
        _id
    } = request;

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

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getPriorityColor = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'emergency':
                return styles.emergency;
            case 'high':
                return styles.high;
            case 'medium':
                return styles.medium;
            case 'low':
                return styles.low;
            default:
                return styles.medium;
        }
    };

    return (
        <div className={styles.maintenanceCard}>
            <div className={styles.header}>
                <div className={styles.titleSection}>
                    <h3>{title}</h3>
                    <span className={`${styles.priority} ${getPriorityColor(priority)}`}>
                        {priority}
                    </span>
                </div>
                <span className={`${styles.status} ${styles[status?.toLowerCase().replace(' ', '')]}`}>
                    {getStatusIcon(status)} {status}
                </span>
            </div>

            <div className={styles.content}>
                <div className={styles.info}>
                    <span className={styles.label}>Property:</span>
                    <span>{propertyName}</span>
                </div>
                <div className={styles.info}>
                    <span className={styles.label}>Tenant:</span>
                    <span>{tenantName}</span>
                </div>
                <div className={styles.info}>
                    <span className={styles.label}>Submitted:</span>
                    <span>{formatDate(requestDate)}</span>
                </div>
                
                <div className={styles.description}>
                    <span className={styles.label}>Description:</span>
                    <p>{description}</p>
                </div>
            </div>

            <div className={styles.actions}>
                <select
                    value={status}
                    onChange={(e) => onUpdateStatus(_id, e.target.value)}
                    className={styles.statusSelect}
                >
                    <option value="pending">Pending</option>
                    <option value="in progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                </select>
            </div>
        </div>
    );
};

export default MaintenanceCard;