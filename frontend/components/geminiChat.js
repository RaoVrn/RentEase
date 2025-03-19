import { useState } from "react";

export default function GeminiChat() {
    const [prompt, setPrompt] = useState("");
    const [response, setResponse] = useState("");
    const [loading, setLoading] = useState(false);

    const generateResponse = async () => {
        if (!prompt.trim()) return;
        setLoading(true);
        
        try {
            const res = await fetch("http://localhost:5000/api/gemini/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt }),
            });

            const data = await res.json();
            setResponse(data.response || "No response from AI.");
        } catch (error) {
            setResponse("Error fetching response.");
        }

        setLoading(false);
    };

    return (
        <div style={{ padding: "20px", textAlign: "center" }}>
            <h2>Ask Gemini AI</h2>
            <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Type your query..."
                rows="4"
                cols="50"
            />
            <br />
            <button onClick={generateResponse} disabled={loading}>
                {loading ? "Generating..." : "Ask Gemini"}
            </button>
            <p><strong>Response:</strong> {response}</p>
        </div>
    );
}
