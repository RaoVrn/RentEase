import { useEffect, useRef } from 'react';
import styles from '../styles/messageThread.module.css';

const MessageThread = ({ messages, currentUser, otherUser, onSendMessage }) => {
    const messageEndRef = useRef(null);

    useEffect(() => {
        messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const formatTimestamp = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <div className={styles.messageThread}>
            <div className={styles.threadHeader}>
                <div className={styles.userInfo}>
                    <div className={styles.avatar}>
                        {otherUser?.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <h3>{otherUser?.name || 'User'}</h3>
                </div>
            </div>

            <div className={styles.messageList}>
                {messages.map((message, index) => (
                    <div
                        key={message._id || index}
                        className={`${styles.messageItem} ${
                            message.senderId === currentUser._id 
                                ? styles.sent 
                                : styles.received
                        }`}
                    >
                        <div className={styles.messageContent}>
                            <p>{message.content}</p>
                            <span className={styles.timestamp}>
                                {formatTimestamp(message.timestamp)}
                            </span>
                        </div>
                    </div>
                ))}
                <div ref={messageEndRef} />
            </div>

            <form 
                className={styles.messageForm}
                onSubmit={(e) => {
                    e.preventDefault();
                    const input = e.target.message;
                    const content = input.value.trim();
                    if (content) {
                        onSendMessage(content);
                        input.value = '';
                    }
                }}
            >
                <input
                    type="text"
                    name="message"
                    placeholder="Type your message..."
                    className={styles.messageInput}
                    autoComplete="off"
                />
                <button type="submit" className={styles.sendButton}>
                    Send
                </button>
            </form>
        </div>
    );
};

export default MessageThread;