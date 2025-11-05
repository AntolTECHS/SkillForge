import { useState } from "react";
import { Send } from "lucide-react";

const StudentChat = () => {
  const [messages, setMessages] = useState([
    { from: "ai", text: "Hi there! How can I help you with your studies today?" },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    const newMsg = { from: "user", text: input };
    setMessages((prev) => [...prev, newMsg, { from: "ai", text: "That's interesting! Tell me more." }]);
    setInput("");
  };

  return (
    <div className="p-6 flex flex-col h-[80vh]">
      <h1 className="text-3xl font-bold mb-4">🤖 Chat with AI</h1>
      <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow p-4 overflow-y-auto">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`mb-3 flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`px-4 py-2 rounded-2xl ${
                msg.from === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-900"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask the AI anything..."
          className="flex-1 p-3 border rounded-xl outline-none"
        />
        <button
          onClick={handleSend}
          className="ml-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 flex items-center gap-2"
        >
          <Send size={18} /> Send
        </button>
      </div>
    </div>
  );
};

export default StudentChat;
