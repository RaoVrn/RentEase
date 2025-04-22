import { useRouter } from 'next/router';
import Link from 'next/link';
import styles from '../styles/landlordSidebar.module.css';

const LandlordSidebar = () => {
    const router = useRouter();
    
    return (
        <aside className={styles.landlordSidebar}>
            <h2>Landlord Portal</h2>
            <ul className={styles.navList}>
                <li>
                    <Link 
                        href="/landlord" 
                        className={`${styles.navItem} ${router.pathname === "/landlord" ? styles.active : ""}`}
                    >
                        <span>📊</span> Dashboard
                    </Link>
                </li>
                <li>
                    <Link 
                        href="/landlord/properties" 
                        className={`${styles.navItem} ${router.pathname === "/landlord/properties" ? styles.active : ""}`}
                    >
                        <span>🏘️</span> Properties
                    </Link>
                </li>
                <li>
                    <Link 
                        href="/landlord/applications" 
                        className={`${styles.navItem} ${router.pathname === "/landlord/applications" ? styles.active : ""}`}
                    >
                        <span>📋</span> Applications
                    </Link>
                </li>
                <li>
                    <Link 
                        href="/landlord/payments" 
                        className={`${styles.navItem} ${router.pathname === "/landlord/payments" ? styles.active : ""}`}
                    >
                        <span>💰</span> Payments
                    </Link>
                </li>
                <li>
                    <Link 
                        href="/landlord/maintenance" 
                        className={`${styles.navItem} ${router.pathname === "/landlord/maintenance" ? styles.active : ""}`}
                    >
                        <span>🔧</span> Maintenance
                    </Link>
                </li>
                <li>
                    <Link 
                        href="/landlord/messages" 
                        className={`${styles.navItem} ${router.pathname === "/landlord/messages" ? styles.active : ""}`}
                    >
                        <span>✉️</span> Messages
                    </Link>
                </li>
                <li>
                    <Link 
                        href="/landlord/profile" 
                        className={`${styles.navItem} ${router.pathname === "/landlord/profile" ? styles.active : ""}`}
                    >
                        <span>👤</span> Profile
                    </Link>
                </li>
            </ul>
            <button className={styles.logoutButton}>
                🚪 Logout
            </button>
        </aside>
    );
};

export default LandlordSidebar;