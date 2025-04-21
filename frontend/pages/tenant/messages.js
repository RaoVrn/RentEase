import { useState, useEffect, useRef } from 'react';
import TenantSidebar from '../../components/TenantSidebar';
import styles from '../../styles/tenantMessages.module.css';

// TODO: Replace with dynamic tenant ID from auth/session
const tenantId = "6608e12a63c78b331cf75d12";

const Messages = () => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const chatEndRef = useRef(null);

    // 🔁 Scroll to bottom on new message
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // 📥 Fetch all messages for this tenant
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/tenant/messages/${tenantId}`);
                if (!res.ok) throw new Error("Response not OK");

                const data = await res.json();
                setMessages(data);
            } catch (error) {
                console.error("❌ Failed to fetch messages:", error);
            }
        };

        fetchMessages();
    }, []);

    // 📤 Send new message
    const handleSend = async () => {
        if (!newMessage.trim()) return;

        const messageData = {
            from: 'tenant',
            to: 'landlord',
            text: newMessage,
            tenantId
        };

        try {
            const res = await fetch('http://localhost:5000/api/tenant/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(messageData)
            });

            if (!res.ok) throw new Error("Message send failed");

            const savedMessage = await res.json();
            setMessages(prev => [...prev, savedMessage]);
            setNewMessage('');
        } catch (error) {
            console.error("❌ Failed to send message:", error);
        }
    };

    return (
        <div className={styles.pageWrapper}>
            <TenantSidebar />

            <div className={styles.messagesContainer}>
                <h1 className={styles.messagesHeader}>Messages</h1>

                <div className={styles.chatBox}>
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`${styles.message} ${
                                msg.from === 'tenant'
                                    ? styles.tenantMessage
                                    : styles.landlordMessage
                            }`}
                        >
                            {msg.text}
                        </div>
                    ))}
                    <div ref={chatEndRef} />
                </div>

                <div className={styles.messageInput}>
                    <input
                        type="text"
                        className={styles.inputField}
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <button className={styles.sendButton} onClick={handleSend}>
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Messages;
