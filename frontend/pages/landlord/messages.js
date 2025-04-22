import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import { AuthContext } from '../_app';
import LandlordSidebar from '../../components/LandlordSidebar';
import MessageThread from '../../components/MessageThread';
import { toast } from 'react-toastify';
import styles from '../../styles/landlordMessages.module.css';

const Messages = () => {
    const { user } = useContext(AuthContext);
    const router = useRouter();
    const [conversations, setConversations] = useState([]);
    const [selectedTenant, setSelectedTenant] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!user || user.role !== 'landlord') {
            router.push('/login');
            return;
        }
        fetchConversations();
    }, [user]);

    useEffect(() => {
        if (selectedTenant) {
            fetchMessages(selectedTenant._id);
        }
    }, [selectedTenant]);

    const fetchConversations = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/landlord/${user.id}/conversations`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch conversations');

            const data = await response.json();
            setConversations(data);
            if (data.length > 0 && !selectedTenant) {
                setSelectedTenant(data[0]);
            }
        } catch (err) {
            console.error('Failed to fetch conversations:', err);
            setError('Failed to load conversations');
            toast.error('Failed to load conversations');
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (tenantId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/landlord/messages/${tenantId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch messages');

            const data = await response.json();
            setMessages(data);
        } catch (err) {
            console.error('Failed to fetch messages:', err);
            toast.error('Failed to load messages');
        }
    };

    const handleSendMessage = async (content) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    recipientId: selectedTenant._id,
                    content,
                    senderId: user.id
                })
            });

            if (!response.ok) throw new Error('Failed to send message');

            const newMessage = await response.json();
            setMessages(prev => [...prev, newMessage]);
        } catch (err) {
            console.error('Failed to send message:', err);
            toast.error('Failed to send message');
        }
    };

    if (loading) return <div className={styles.loading}>Loading...</div>;
    if (error) return <div className={styles.error}>{error}</div>;

    return (
        <div className={styles.messagesContainer}>
            <LandlordSidebar />
            <main className={styles.mainContent}>
                <div className={styles.chatLayout}>
                    <div className={styles.conversationsList}>
                        <h2>Conversations</h2>
                        <div className={styles.tenantList}>
                            {conversations.map(tenant => (
                                <div
                                    key={tenant._id}
                                    className={`${styles.tenantItem} ${
                                        selectedTenant?._id === tenant._id ? styles.active : ''
                                    }`}
                                    onClick={() => setSelectedTenant(tenant)}
                                >
                                    <div className={styles.tenantAvatar}>
                                        {tenant.name[0].toUpperCase()}
                                    </div>
                                    <div className={styles.tenantInfo}>
                                        <h3>{tenant.name}</h3>
                                        <p>{tenant.propertyName || 'Property not assigned'}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={styles.chatArea}>
                        {selectedTenant ? (
                            <MessageThread
                                messages={messages}
                                currentUser={user}
                                otherUser={selectedTenant}
                                onSendMessage={handleSendMessage}
                            />
                        ) : (
                            <div className={styles.noChat}>
                                <p>Select a tenant to start messaging</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Messages;