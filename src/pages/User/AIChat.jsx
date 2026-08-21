import { useState, useEffect, useRef } from "react";

const AIChat = () => {
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            content: "Hi! I'm your AI assistant 🤖 I can help you manage your tasks, suggest schedules, and break down your goals. What would you like help with today?",
        },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [createdCount, setCreatedCount] = useState(0);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMessage = { role: "user", content: input.trim() };
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        setInput("");
        setLoading(true);

        const token = localStorage.getItem("token");

        fetch("https://task-manager-backend-fdic.onrender.com/api/tasks/ai-chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                messages: updatedMessages.map((m) => ({
                    role: m.role,
                    content: m.content,
                })),
            }),
        })
            .then((res) => res.json())
            .then((data) => {
                const reply = data.reply || "Sorry, I ran into an error. Please try again.";
                setMessages((prev) => [
                    ...prev,
                    { role: "assistant", content: reply },
                ]);

                // If AI created tasks, show a notification banner
                if (data.createdTasks && data.createdTasks.length > 0) {
                    setCreatedCount(data.createdTasks.length);
                    setTimeout(() => setCreatedCount(0), 5000);
                }
            })
            .catch(() => {
                setMessages((prev) => [
                    ...prev,
                    { role: "assistant", content: "Sorry, I ran into an error. Please try again." },
                ]);
            })
            .finally(() => setLoading(false));
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const formatMessage = (content) => {
        // Convert **bold** to <strong>
        let formatted = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Convert *italic* to <em>
        formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
        // Convert newlines to <br>
        formatted = formatted.replace(/\n/g, '<br>');
        return formatted;
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-4 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xl">
                        🤖
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-gray-800">AI Assistant</h1>
                        <p className="text-xs text-gray-500">Ask me anything about your tasks and schedule</p>
                    </div>
                </div>
            </div>

            {/* Task Created Banner */}
            {createdCount > 0 && (
                <div className="bg-green-500 text-white text-center py-2 px-4 text-sm font-medium">
                    ✅ {createdCount} task{createdCount > 1 ? 's' : ''} created and added to your task list!
                </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 md:px-6 py-4 space-y-4">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                        {msg.role === "assistant" && (
                            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm mr-2 flex-shrink-0 mt-1">
                                🤖
                            </div>
                        )}
                        <div
                            className={`max-w-[85%] md:max-w-[70%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                                msg.role === "user"
                                    ? "bg-indigo-600 text-white rounded-tr-sm"
                                    : "bg-white text-gray-800 shadow-sm border border-gray-100 rounded-tl-sm"
                            }`}
                        >
                            {msg.role === "assistant" ? (
                                <span
                                    dangerouslySetInnerHTML={{
                                        __html: formatMessage(msg.content),
                                    }}
                                />
                            ) : (
                                msg.content
                            )}
                        </div>
                        {msg.role === "user" && (
                            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-sm ml-2 flex-shrink-0 mt-1">
                                👤
                            </div>
                        )}
                    </div>
                ))}

                {loading && (
                    <div className="flex justify-start">
                        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm mr-2 flex-shrink-0">
                            🤖
                        </div>
                        <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100">
                            <div className="flex gap-1 items-center">
                                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="bg-white border-t border-gray-200 px-3 md:px-6 py-3 flex-shrink-0">
                <div className="flex gap-2 items-end max-w-4xl mx-auto">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask about your tasks, schedule, goals..."
                        rows={1}
                        className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none bg-gray-50"
                        style={{ minHeight: "44px", maxHeight: "120px" }}
                        onInput={(e) => {
                            e.target.style.height = "auto";
                            e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
                        }}
                    />
                    <button
                        onClick={handleSend}
                        disabled={loading || !input.trim()}
                        className="bg-indigo-600 text-white px-4 py-3 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0 font-medium text-sm"
                    >
                        {loading ? "..." : "Send"}
                    </button>
                </div>
                <p className="text-xs text-gray-400 text-center mt-2">
                    Press Enter to send • Shift+Enter for new line • AI can create tasks for you
                </p>
            </div>
        </div>
    );
};

export default AIChat;
