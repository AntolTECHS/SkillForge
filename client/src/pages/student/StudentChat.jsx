import React, { useEffect, useState, useRef } from "react";
import { Send } from "lucide-react";
import axios from "axios";
import Sidebar from "../../components/Sidebar";

export default function StudentChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  const BACKEND_CHAT_URL = "http://localhost:5000/api/skillforge/chat";
  const BACKEND_HISTORY_URL = "http://localhost:5000/api/skillforge/history";

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Fetch chat history
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get(BACKEND_HISTORY_URL, {
          headers: getAuthHeaders(),
        });

        if (!res.data.messages || res.data.messages.length === 0) {
          setMessages([
            {
              id: "welcome",
              from: "ai",
              text:
                "Hello there! I'm your AI learning assistant from SmartLearn. How can I help you today?",
            },
          ]);
        } else {
          setMessages(res.data.messages.map((m, i) => ({ id: i, ...m })));
        }
      } catch (err) {
        console.error("Failed to load chat history:", err);
        setMessages([
          {
            id: "welcome",
            from: "ai",
            text: "Hello! I'm your AI learning assistant.",
          },
        ]);
      }
    };

    fetchHistory();
  }, []);

  // Scroll to bottom on new message
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { id: Date.now(), from: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post(
        BACKEND_CHAT_URL,
        { message: userMsg.text },
        { headers: getAuthHeaders() }
      );

      const aiText =
        res.data.reply || "Sorry, I couldn’t generate a response right now.";

      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, from: "ai", text: aiText },
      ]);
    } catch (err) {
      console.error("SkillForge AI chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 2,
          from: "ai",
          text: "⚠️ Something went wrong. Please try again later.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-gray-100 text-gray-900">
      {/* SIDEBAR */}
      <Sidebar />

      {/* CHAT SECTION */}
      <div className="flex-1 flex flex-col bg-gray-100 relative lg:ml-64">
        {/* CHAT CONTENT */}
        <main className="flex-1 overflow-y-auto w-full py-6">
          <div className="flex flex-col gap-4 w-full px-4 sm:px-6 lg:px-0">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex w-full ${
                  msg.from === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`rounded-2xl px-5 py-3 shadow-md leading-relaxed text-[15px] whitespace-pre-wrap
                    ${
                      msg.from === "user"
                        ? "bg-blue-100 text-blue-900 max-w-[60%] lg:mr-10"
                        : "bg-gray-200 text-gray-900 border border-gray-300 w-full sm:max-w-[60%]"
                    }`}
                  // No additional inline styles needed
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="text-gray-500 italic text-sm ml-2">
                AI is typing...
              </div>
            )}

            <div ref={scrollRef} />
          </div>
        </main>

        {/* INPUT BAR */}
        <div className="sticky bottom-0 flex justify-start bg-gray-100 py-4 border-t border-gray-300 px-4 sm:px-6 lg:px-0">
          <div className="flex items-center bg-white rounded-2xl border border-gray-300 shadow-md overflow-hidden w-full max-w-7xl mx-auto">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 outline-none bg-transparent placeholder-gray-400 text-gray-900"
            />

            <button
              onClick={handleSend}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white px-6 py-3 flex items-center gap-2"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
