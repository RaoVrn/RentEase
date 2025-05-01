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
            setLoading(true);
            setError('');
            const token = localStorage.getItem('token');
            
            if (!token) {
                throw new Error('No authentication token found');
            }

            if (!user?.id) {
                throw new Error('User ID not found');
            }

            console.log('🟢 Fetching conversations for user:', user.id);
            const response = await fetch(`/api/landlord/${user.id}/conversations`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('❌ API Error:', errorData);
                throw new Error(errorData.message || 'Failed to fetch conversations');
            }

            const data = await response.json();
            console.log('🟢 Received conversations:', data.length);
            
            if (!Array.isArray(data)) {
                throw new Error('Invalid response format: expected an array');
            }

            setConversations(data);
            if (data.length > 0 && !selectedTenant) {
                setSelectedTenant(data[0]);
            }
        } catch (err) {
            console.error('❌ Failed to fetch conversations:', err);
            setError(err.message || 'Failed to load conversations');
            toast.error(err.message || 'Failed to load conversations');
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (tenantId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            console.log('🟢 Fetching messages for tenant:', tenantId);
            const response = await fetch(`/api/landlord/messages/${tenantId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('❌ API Error:', errorData);
                throw new Error(errorData.message || 'Failed to fetch messages');
            }

            const data = await response.json();
            console.log('🟢 Received messages:', data.length);
            setMessages(data);
        } catch (err) {
            console.error('❌ Failed to fetch messages:', err);
            toast.error(err.message || 'Failed to load messages');
        }
    };

    const handleSendMessage = async (content) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            if (!selectedTenant?._id) {
                throw new Error('No tenant selected');
            }

            console.log('🟢 Sending message to tenant:', selectedTenant._id);
            const response = await fetch('/api/landlord/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    tenantId: selectedTenant._id,
                    text: content
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('❌ API Error:', errorData);
                throw new Error(errorData.message || 'Failed to send message');
            }

            const newMessage = await response.json();
            console.log('🟢 Message sent successfully');
            setMessages(prev => [...prev, newMessage]);
            // Refresh conversations to update last message
            fetchConversations();
        } catch (err) {
            console.error('❌ Failed to send message:', err);
            toast.error(err.message || 'Failed to send message');
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
                                        {tenant.lastMessage && (
                                            <p className={styles.lastMessage}>
                                                {tenant.lastMessage.text}
                                            </p>
                                        )}
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