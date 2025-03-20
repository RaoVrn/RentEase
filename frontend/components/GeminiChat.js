import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown"; // Markdown Support
import { motion, AnimatePresence } from "framer-motion"; // For Smooth UI Transitions

export default function GeminiChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [prompt, setPrompt] = useState("");
    const [loading, setLoading] = useState(false);
    const chatContainerRef = useRef(null); // Auto-scroll to latest message

    useEffect(() => {
        // Auto-scroll to bottom on new messages
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const generateResponse = async () => {
        if (!prompt.trim()) return;
        setLoading(true);

        const newMessages = [...messages, { text: prompt, sender: "user" }];
        setMessages([...newMessages, { text: "🔍 Keyara is thinking...", sender: "keyara", isLoading: true }]);
        setPrompt(""); // Clear input for better UX

        try {
            const res = await fetch("http://localhost:5000/api/gemini/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt }),
            });

            const data = await res.json();
            const responseText = data.response || "⚠️ No response from Keyara.";

            // Remove "Analyzing..." and replace with actual AI response
            setMessages([...newMessages, { text: responseText, sender: "keyara", isMarkdown: true }]);
        } catch (error) {
            setMessages([...newMessages, { text: "⚠️ API Error. Please try again.", sender: "keyara" }]);
        }

        setLoading(false);
    };

    // Handle Enter Key Press
    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !loading) {
            e.preventDefault();
            generateResponse();
        }
    };

    return (
        <>
            {/* Floating Chat Button */}
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
                style={{
                    position: "fixed",
                    bottom: "20px",
                    right: "20px",
                    background: "linear-gradient(135deg, #007bff, #00d4ff)",
                    color: "white",
                    borderRadius: "50%",
                    width: "60px",
                    height: "60px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    cursor: "pointer",
                    boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
                    zIndex: 1000,
                    backdropFilter: "blur(10px)"
                }}
                onClick={() => setIsOpen(!isOpen)}
            >
                💬
            </motion.div>

            {/* Chat Box */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        style={{
                            position: "fixed",
                            bottom: "90px",
                            right: "20px",
                            width: "420px",
                            background: "rgba(27, 27, 27, 0.95)",
                            color: "white",
                            boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
                            borderRadius: "15px",
                            padding: "20px",
                            display: "flex",
                            flexDirection: "column",
                            zIndex: 9999,
                            backdropFilter: "blur(12px)"
                        }}
                    >
                        {/* Chat Header */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid rgba(255,255,255,0.2)", paddingBottom: "10px", marginBottom: "10px" }}>
                            <h3 style={{ margin: 0, fontSize: "18px", color: "#00d4ff" }}>💡 Keyara Chat</h3>
                            <motion.span
                                style={{ cursor: "pointer", fontSize: "20px", fontWeight: "bold", color: "#fff" }}
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.8 }}
                                onClick={() => setIsOpen(false)}
                            >
                                ×
                            </motion.span>
                        </div>

                        {/* Chat Messages */}
                        <div ref={chatContainerRef} style={{ minHeight: "250px", maxHeight: "350px", overflowY: "auto", padding: "10px", background: "rgba(37, 37, 37, 0.9)", borderRadius: "10px", marginBottom: "10px", fontSize: "14px", display: "flex", flexDirection: "column" }}>
                            {messages.length === 0 ? (
                                <p style={{ textAlign: "center", color: "#888" }}>Ask anything...</p>
                            ) : (
                                messages.map((msg, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, ease: "easeOut" }}
                                        style={{
                                            background: msg.sender === "user" ? "#007bff" : "#383838",
                                            alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                                            padding: "12px",
                                            borderRadius: "15px",
                                            marginBottom: "8px",
                                            maxWidth: "80%",
                                            fontSize: "15px",
                                            color: msg.sender === "user" ? "white" : "#ddd",
                                            fontStyle: msg.isLoading ? "italic" : "normal",
                                        }}
                                    >
                                        {msg.isLoading ? (
                                            <motion.span
                                                initial={{ opacity: 0.2 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
                                                style={{ display: "flex", alignItems: "center", gap: "5px" }}
                                            >
                                                <span>🔍 Keyara is thinking</span>
                                                <span>.</span>
                                                <span>.</span>
                                                <span>.</span>
                                            </motion.span>
                                        ) : msg.isMarkdown ? (
                                            <ReactMarkdown>{msg.text}</ReactMarkdown>
                                        ) : (
                                            msg.text
                                        )}
                                    </motion.div>
                                ))
                            )}
                        </div>

                        {/* Input Field */}
                        <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Type your query..." rows="2" onKeyPress={handleKeyPress} style={{ width: "100%", border: "none", borderRadius: "10px", padding: "10px", fontSize: "14px", background: "rgba(255,255,255,0.1)", color: "white", resize: "none", outline: "none" }} />

                        {/* Chat Button */}
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={generateResponse} disabled={loading} style={{ width: "100%", padding: "12px", marginTop: "10px", background: "#00d4ff", color: "white", border: "none", borderRadius: "10px", cursor: "pointer", fontSize: "16px", fontWeight: "bold" }}>Ask Keyara</motion.button>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
