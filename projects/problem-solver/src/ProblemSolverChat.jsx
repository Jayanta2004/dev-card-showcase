
import { useState, useRef, useEffect } from "react";


const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

export default function ProblemSolverChat() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "👋 Hi! I'm your Problem Solver. Tell me your problem and I'll help you fix it step by step!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    const userMessage = { role: "user", content: text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const chatHistory = updatedMessages.filter((m) => m.role === "user" || m.role === "assistant");

      // Groq needs conversation to start with user message
      while (chatHistory.length > 0 && chatHistory[0].role === "assistant") {
        chatHistory.shift();
      }

      const body = {
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: "You are a friendly and helpful problem-solving assistant. Help the user solve their problems step by step. Keep your answers clear, simple, and easy to understand. Be encouraging and positive.",
          },
          ...chatHistory,
        ],
        max_tokens: 1000,
      };

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      console.log("Status:", response.status, "Data:", data);

      if (!response.ok) throw new Error(data.error?.message || "API Error");

      const reply = data.choices?.[0]?.message?.content || "No response received.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      console.error("Error:", err);
      setMessages((prev) => [...prev, { role: "assistant", content: `⚠️ Error: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div style={styles.page}>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700&family=DM+Sans:wght@400;500&display=swap" rel="stylesheet" />

      <div style={styles.header}>
        <span style={styles.logo}>🧠</span>
        <div>
          <div style={styles.title}>Problem Solver</div>
          <div style={styles.subtitle}>Describe your problem — I'll help you solve it!</div>
        </div>
      </div>

      <div style={styles.chatArea}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            ...styles.bubble,
            alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
            background: msg.role === "user" ? "#f4a261" : "#ffffff",
            color: msg.role === "user" ? "#fff" : "#1a1a2e",
            borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
          }}>
            {msg.content}
          </div>
        ))}

        {loading && (
          <div style={{ ...styles.bubble, alignSelf: "flex-start", background: "#fff", color: "#999", fontStyle: "italic" }}>
            ⏳ Thinking...
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={styles.inputRow}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your problem here... (Press Enter to send)"
          style={styles.textarea}
          rows={1}
        />
        <button onClick={sendMessage} disabled={loading || !input.trim()}
          style={{ ...styles.button, opacity: loading || !input.trim() ? 0.5 : 1, cursor: loading || !input.trim() ? "not-allowed" : "pointer" }}>
          Send ➤
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: { fontFamily: "'DM Sans', sans-serif", display: "flex", flexDirection: "column", height: "100vh", maxWidth: "700px", margin: "0 auto", background: "#f0f4ff" },
  header: { display: "flex", alignItems: "center", gap: "14px", padding: "20px 24px", background: "#1a1a2e", color: "#fff" },
  logo: { fontSize: "36px" },
  title: { fontFamily: "'Syne', sans-serif", fontSize: "22px", fontWeight: "700", color: "#f4a261" },
  subtitle: { fontSize: "13px", color: "#aab4c8", marginTop: "2px" },
  chatArea: { flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: "12px" },
  bubble: { maxWidth: "75%", padding: "12px 16px", fontSize: "15px", lineHeight: "1.6", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", whiteSpace: "pre-wrap" },
  inputRow: { display: "flex", gap: "10px", padding: "16px 24px", background: "#ffffff", borderTop: "1px solid #e2e8f0" },
  textarea: { flex: 1, padding: "12px 16px", fontSize: "15px", fontFamily: "'DM Sans', sans-serif", border: "2px solid #e2e8f0", borderRadius: "12px", resize: "none", outline: "none", background: "#f8fafc" },
  button: { padding: "12px 22px", background: "#f4a261", color: "#fff", fontFamily: "'Syne', sans-serif", fontWeight: "700", fontSize: "15px", border: "none", borderRadius: "12px" },
};