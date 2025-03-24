import TenantSidebar from '../../components/TenantSidebar';

const Payments = () => {
    return (
        <div className="flex">
            <TenantSidebar />
            <main className="flex-1 p-6">
                <h1 className="text-3xl font-bold">Payments</h1>
                <p>View and manage your rental payments.</p>
            </main>
        </div>
    );
};

export default Payments;
