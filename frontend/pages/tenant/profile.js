import { useState, useEffect } from 'react';
import TenantSidebar from '../../components/TenantSidebar';
import styles from '../../styles/tenantProfile.module.css';

const Profile = () => {
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        avatar: '',
        createdAt: '',
        updatedAt: ''
    });

    const [editing, setEditing] = useState(false);
    const [tempProfile, setTempProfile] = useState({ ...profile });
    const [avatarFile, setAvatarFile] = useState(null);
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch(`http://localhost:5000/api/users/profile`, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    }
                });

                if (!res.ok) throw new Error("Failed to fetch profile");

                const data = await res.json();
                setProfile(data);
                setTempProfile(data);

                const avatarURL = data.avatar
                    ? data.avatar.startsWith('http')
                        ? data.avatar
                        : `http://localhost:5000${data.avatar}`
                    : '/default-avatar.jpg';

                setPreview(`${avatarURL}?t=${Date.now()}`); // ensure latest image loads
            } catch (err) {
                console.error("❌ Failed to fetch profile:", err);
            }
        };

        fetchProfile();
    }, []);

    const handleChange = (e) => {
        setTempProfile({ ...tempProfile, [e.target.name]: e.target.value });
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            const tempURL = URL.createObjectURL(file);
            setPreview(tempURL);
        }
    };

    const handleSave = async () => {
        try {
            const token = localStorage.getItem("token");

            const formData = new FormData();
            formData.append('name', tempProfile.name);
            formData.append('phone', tempProfile.phone);
            formData.append('address', tempProfile.address);
            if (avatarFile) formData.append('avatar', avatarFile);

            const res = await fetch(`http://localhost:5000/api/users/profile/update`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            });

            if (!res.ok) throw new Error("Failed to update profile");

            const result = await res.json();
            const updated = result.user || result;

            setProfile(updated);
            setTempProfile(updated);

            const updatedAvatar = updated.avatar
                ? updated.avatar.startsWith('http')
                    ? updated.avatar
                    : `http://localhost:5000${updated.avatar}`
                : '/default-avatar.jpg';

            setPreview(`${updatedAvatar}?t=${Date.now()}`); // force refresh preview
            setAvatarFile(null);
            setEditing(false);
        } catch (err) {
            console.error("❌ Update failed:", err);
        }
    };

    const handleCancel = () => {
        setTempProfile(profile);
        setAvatarFile(null);

        const avatarURL = profile.avatar
            ? profile.avatar.startsWith('http')
                ? profile.avatar
                : `http://localhost:5000${profile.avatar}`
            : '/default-avatar.jpg';

        setPreview(`${avatarURL}?t=${Date.now()}`);
        setEditing(false);
    };

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.sidebarWrapper}>
                <TenantSidebar />
            </div>

            <div className={styles.profileContainer}>
                <h1 className={styles.header}>Your Profile</h1>

                <div className={styles.profileCard}>
                    <div className={styles.avatarSection}>
                        {preview && (
                            <img
                                src={preview}
                                alt="User Avatar"
                                className={styles.avatar}
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "/default-avatar.jpg";
                                }}
                            />
                        )}
                        {editing && (
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                className={styles.fileInput}
                            />
                        )}
                    </div>

                    {["name", "email", "phone", "address"].map((field) => (
                        <div className={styles.field} key={field}>
                            <label>{field.charAt(0).toUpperCase() + field.slice(1)}:</label>
                            {editing && field !== "email" ? (
                                <input
                                    type="text"
                                    name={field}
                                    value={tempProfile[field] || ''}
                                    onChange={handleChange}
                                    className={styles.inlineInput}
                                />
                            ) : (
                                <p>{profile[field] || '—'}</p>
                            )}
                        </div>
                    ))}

                    <div className={styles.field}>
                        <label>Joined:</label>
                        <p>{profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '—'}</p>
                    </div>

                    <div className={styles.field}>
                        <label>Last Login:</label>
                        <p>{profile.updatedAt ? new Date(profile.updatedAt).toLocaleString() : '—'}</p>
                    </div>

                    {!editing ? (
                        <button className={styles.editButton} onClick={() => setEditing(true)}>
                            Edit Profile
                        </button>
                    ) : (
                        <div className={styles.actionButtons}>
                            <button className={styles.saveButton} onClick={handleSave}>Save</button>
                            <button className={styles.cancelButton} onClick={handleCancel}>Cancel</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
