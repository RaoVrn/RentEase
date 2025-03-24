import { useRouter } from 'next/router';
import Link from 'next/link';
import styles from '../styles/TenantSidebar.module.css';

const TenantSidebar = () => {
    const router = useRouter();
    
    return (
        <aside className={styles.tenantSidebar}>
            <h2>Tenant Dashboard</h2>
            <ul className={styles.navList}>
                <li>
                    <Link 
                        href="/tenant" 
                        className={`${styles.navItem} ${router.pathname === "/tenant" ? styles.active : ""}`}
                    >
                        <span>🏠</span> Dashboard
                    </Link>
                </li>
                <li>
                    <Link 
                        href="/tenant/applications" 
                        className={`${styles.navItem} ${router.pathname === "/tenant/applications" ? styles.active : ""}`}
                    >
                        <span>📋</span> Applications
                    </Link>
                </li>
                <li>
                    <Link 
                        href="/tenant/payments" 
                        className={`${styles.navItem} ${router.pathname === "/tenant/payments" ? styles.active : ""}`}
                    >
                        <span>💳</span> Payments
                    </Link>
                </li>
                <li>
                    <Link 
                        href="/tenant/maintenance" 
                        className={`${styles.navItem} ${router.pathname === "/tenant/maintenance" ? styles.active : ""}`}
                    >
                        <span>🔧</span> Maintenance
                    </Link>
                </li>
                <li>
                    <Link 
                        href="/tenant/messages" 
                        className={`${styles.navItem} ${router.pathname === "/tenant/messages" ? styles.active : ""}`}
                    >
                        <span>✉️</span> Messages
                    </Link>
                </li>
                <li>
                    <Link 
                        href="/tenant/profile" 
                        className={`${styles.navItem} ${router.pathname === "/tenant/profile" ? styles.active : ""}`}
                    >
                        <span>👤</span> Profile
                    </Link>
                </li>
            </ul>
            <div className={styles.logoutButton}>
                🚪 Logout
            </div>
        </aside>
    );
};

export default TenantSidebar;
