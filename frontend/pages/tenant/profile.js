import TenantSidebar from '../../components/TenantSidebar';

const Profile = () => {
    return (
        <div className="flex">
            <TenantSidebar />
            <main className="flex-1 p-6">
                <h1 className="text-3xl font-bold">Profile</h1>
                <p>Manage your profile settings.</p>
            </main>
        </div>
    );
};

export default Profile;
