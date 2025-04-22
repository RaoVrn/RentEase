import React from 'react';
import styles from '../styles/applicationCard.module.css';

const ApplicationCard = ({ application, onAccept, onReject }) => {
    const {
        applicantName,
        propertyName,
        dateApplied,
        status,
        monthlyIncome,
        creditScore,
        employmentStatus,
        currentAddress,
        moveInDate,
        message
    } = application;

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className={styles.applicationCard}>
            <div className={styles.header}>
                <h3>{applicantName}</h3>
                <span className={`${styles.status} ${styles[status.toLowerCase()]}`}>
                    {status}
                </span>
            </div>

            <div className={styles.propertyInfo}>
                <span className={styles.label}>Property:</span>
                <span>{propertyName}</span>
            </div>

            <div className={styles.grid}>
                <div className={styles.info}>
                    <span className={styles.label}>Applied On:</span>
                    <span>{formatDate(dateApplied)}</span>
                </div>
                <div className={styles.info}>
                    <span className={styles.label}>Move-in Date:</span>
                    <span>{formatDate(moveInDate)}</span>
                </div>
                <div className={styles.info}>
                    <span className={styles.label}>Monthly Income:</span>
                    <span>${monthlyIncome.toLocaleString()}</span>
                </div>
                <div className={styles.info}>
                    <span className={styles.label}>Credit Score:</span>
                    <span>{creditScore}</span>
                </div>
                <div className={styles.info}>
                    <span className={styles.label}>Employment:</span>
                    <span>{employmentStatus}</span>
                </div>
                <div className={styles.info}>
                    <span className={styles.label}>Current Address:</span>
                    <span>{currentAddress}</span>
                </div>
            </div>

            {message && (
                <div className={styles.message}>
                    <span className={styles.label}>Message:</span>
                    <p>{message}</p>
                </div>
            )}

            {status === 'pending' && (
                <div className={styles.actions}>
                    <button 
                        onClick={() => onAccept(application._id)}
                        className={`${styles.button} ${styles.acceptButton}`}
                    >
                        Accept
                    </button>
                    <button 
                        onClick={() => onReject(application._id)}
                        className={`${styles.button} ${styles.rejectButton}`}
                    >
                        Reject
                    </button>
                </div>
            )}
        </div>
    );
};

export default ApplicationCard;