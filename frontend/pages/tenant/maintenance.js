import TenantSidebar from '../../components/TenantSidebar';

const Maintenance = () => {
    return (
        <div className="flex">
            <TenantSidebar />
            <main className="flex-1 p-6">
                <h1 className="text-3xl font-bold">Maintenance Requests</h1>
                <p>Submit and track maintenance issues.</p>
            </main>
        </div>
    );
};

export default Maintenance;
