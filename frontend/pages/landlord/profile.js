import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import { AuthContext } from '../_app';
import LandlordSidebar from '../../components/LandlordSidebar';
import { toast } from 'react-toastify';
import styles from '../../styles/landlordProfile.module.css';

const Profile = () => {
    const { user } = useContext(AuthContext);
    const router = useRouter();
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        companyName: '',
        businessLicense: '',
        avatar: '',
        createdAt: '',
        updatedAt: ''
    });
    const [editing, setEditing] = useState(false);
    const [tempProfile, setTempProfile] = useState({ ...profile });
    const [avatarFile, setAvatarFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!user || user.role !== 'landlord') {
            router.push('/login');
            return;
        }
        fetchProfile();
    }, [user]);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/landlord/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch profile');

            const data = await response.json();
            setProfile(data);
            setTempProfile(data);
            setPreview(data.avatar || '/default-avatar.jpg');
        } catch (err) {
            console.error('Failed to fetch profile:', err);
            setError('Failed to load profile');
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setTempProfile(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSave = async () => {
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            
            Object.keys(tempProfile).forEach(key => {
                if (tempProfile[key] !== profile[key]) {
                    formData.append(key, tempProfile[key]);
                }
            });

            if (avatarFile) {
                formData.append('avatar', avatarFile);
            }

            const response = await fetch('/api/landlord/profile', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) throw new Error('Failed to update profile');

            const data = await response.json();
            setProfile(data);
            setEditing(false);
            toast.success('Profile updated successfully');
        } catch (err) {
            console.error('Failed to update profile:', err);
            toast.error('Failed to update profile');
        }
    };

    const handleCancel = () => {
        setTempProfile({ ...profile });
        setPreview(profile.avatar || '/default-avatar.jpg');
        setAvatarFile(null);
        setEditing(false);
    };

    if (loading) return <div className={styles.loading}>Loading...</div>;
    if (error) return <div className={styles.error}>{error}</div>;

    return (
        <div className={styles.profileContainer}>
            <LandlordSidebar />
            <main className={styles.mainContent}>
                <h1 className={styles.header}>Profile Settings</h1>

                <div className={styles.profileCard}>
                    <div className={styles.avatarSection}>
                        <img
                            src={preview}
                            alt="Profile Avatar"
                            className={styles.avatar}
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/default-avatar.jpg';
                            }}
                        />
                        {editing && (
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                className={styles.fileInput}
                            />
                        )}
                    </div>

                    <div className={styles.profileInfo}>
                        {['name', 'email', 'phone', 'address', 'companyName', 'businessLicense'].map((field) => (
                            <div className={styles.field} key={field}>
                                <label>
                                    {field.split(/(?=[A-Z])/).join(' ').charAt(0).toUpperCase() + 
                                     field.split(/(?=[A-Z])/).join(' ').slice(1)}:
                                </label>
                                {editing && field !== 'email' ? (
                                    <input
                                        type="text"
                                        name={field}
                                        value={tempProfile[field] || ''}
                                        onChange={handleChange}
                                        className={styles.input}
                                    />
                                ) : (
                                    <p>{profile[field] || '—'}</p>
                                )}
                            </div>
                        ))}

                        <div className={styles.field}>
                            <label>Member Since:</label>
                            <p>{new Date(profile.createdAt).toLocaleDateString()}</p>
                        </div>

                        <div className={styles.actions}>
                            {!editing ? (
                                <button 
                                    className={styles.editButton}
                                    onClick={() => setEditing(true)}
                                >
                                    Edit Profile
                                </button>
                            ) : (
                                <>
                                    <button 
                                        className={styles.saveButton}
                                        onClick={handleSave}
                                    >
                                        Save Changes
                                    </button>
                                    <button 
                                        className={styles.cancelButton}
                                        onClick={handleCancel}
                                    >
                                        Cancel
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Profile;