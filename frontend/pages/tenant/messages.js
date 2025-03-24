import TenantSidebar from '../../components/TenantSidebar';

const Messages = () => {
    return (
        <div className="flex">
            <TenantSidebar />
            <main className="flex-1 p-6">
                <h1 className="text-3xl font-bold">Messages</h1>
                <p>Chat with your landlord.</p>
            </main>
        </div>
    );
};

export default Messages;
