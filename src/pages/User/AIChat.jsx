import React, { useState, useRef, useEffect } from "react";

const AIChat = () => {
    const [messages, setMessages] = useState([
        { role: "assistant", content: "Hi! I'm your AI assistant 🤖 I can help you manage your tasks, suggest schedules, and break down your goals. What would you like help with today?" }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim()) return;
        const userMessage = { role: "user", content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setLoading(true);

        try {
            const token = localStorage.getItem("token");

            // Get user's tasks for context
            const tasksRes = await fetch("https://task-manager-backend-fdic.onrender.com/api/tasks", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const tasksData = await tasksRes.json();
            const taskSummary = tasksData.tasks?.map(t =>
                `- ${t.title} (${t.priority} priority, ${t.status}, due: ${t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'no date'})`
            ).join("\n") || "No tasks yet";

            const res = await fetch("https://task-manager-backend-fdic.onrender.com/api/tasks/ai-chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    messages: [...messages, userMessage].map(m => ({
                        role: m.role,
                        content: m.content
                    })),
                    taskSummary,
                }),
            });
            const data = await res.json();
            setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
        } catch (err) {
            setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I ran into an error. Please try again." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 h-screen flex flex-col">
            <div className="mb-4">
                <h1 className="text-2xl font-bold text-gray-800">🤖 AI Assistant</h1>
                <p className="text-gray-500 text-sm mt-1">Ask me anything about your tasks and schedule</p>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 bg-white rounded-2xl shadow p-4 overflow-y-auto mb-4">
                <div className="space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm ${
                                msg.role === "user"
                                    ? "bg-indigo-600 text-white rounded-br-none"
                                    : "bg-gray-100 text-gray-800 rounded-bl-none"
                            }`}>
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-start">
                            <div className="bg-gray-100 text-gray-500 px-4 py-3 rounded-2xl rounded-bl-none text-sm">
                                Thinking...
                            </div>
                        </div>
                    )}
                    <div ref={bottomRef} />
                </div>
            </div>

            {/* Input */}
            <div className="flex gap-2">
                <input
                    type="text"
                    placeholder="Ask about your tasks, schedule, goals..."
                    className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !loading && sendMessage()}
                />
                <button
                    onClick={sendMessage}
                    disabled={loading}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 text-sm font-medium"
                >
                    Send
                </button>
            </div>
        </div>
    );
};

export default AIChat;