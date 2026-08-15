import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const UserDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [dashboard, setDashboard] = useState(null);
    const [goal, setGoal] = useState("");
    const [aiTasks, setAiTasks] = useState([]);
    const [aiLoading, setAiLoading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [productivity, setProductivity] = useState({ score: 0, streak: 0, label: "" });

    const fetchDashboard = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("https://task-manager-backend-fdic.onrender.com/api/tasks/dashboard-data", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setDashboard(data);
            calculateProductivity(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const calculateProductivity = (data) => {
        if (!data) return;
        const total = data.totalTasks || 0;
        const completed = data.statusSummary?.completed || 0;
        const pending = data.statusSummary?.pending || 0;
        const inProgress = data.statusSummary?.inProgress || 0;

        let score = 0;
        if (total > 0) {
            score = Math.round(
                ((completed * 1.0 + inProgress * 0.5) / total) * 100
            );
        }

        let streak = 0;
        if (score >= 80) streak = Math.min(7, completed);
        else if (score >= 50) streak = Math.min(4, completed);
        else if (score >= 20) streak = Math.min(2, completed);
        else streak = 0;

        let label = "";
        if (score >= 80) label = "Excellent 🚀";
        else if (score >= 60) label = "Good 👍";
        else if (score >= 40) label = "Average 📈";
        else if (score >= 20) label = "Needs Work 💪";
        else label = "Just Starting 🌱";

        setProductivity({ score, streak, label });
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    const handleAISuggest = async () => {
        if (!goal.trim()) return;
        setAiLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("https://task-manager-backend-fdic.onrender.com/api/tasks/ai-suggest", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ goal }),
            });
            const data = await res.json();
            setAiTasks(data.tasks || []);
        } catch (err) {
            console.error(err);
        } finally {
            setAiLoading(false);
        }
    };

    const handleAddAITask = async (task) => {
        try {
            const token = localStorage.getItem("token");
            await fetch("https://task-manager-backend-fdic.onrender.com/api/tasks", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title: task.title,
                    description: task.description,
                    priority: task.priority || "medium",
                    dueDate: task.dueDate || new Date(Date.now() + 7 * 86400000).toISOString(),
                }),
            });
            setAiTasks(prev => prev.filter(t => t.title !== task.title));
            fetchDashboard();
        } catch (err) {
            console.error(err);
        }
    };

    const scoreColor = productivity.score >= 80 ? "text-green-500" :
        productivity.score >= 50 ? "text-yellow-500" : "text-red-500";

    const scoreBarColor = productivity.score >= 80 ? "bg-green-500" :
        productivity.score >= 50 ? "bg-yellow-500" : "bg-red-500";

    return (
        <div className="p-3 sm:p-4 md:p-6 max-w-7xl mx-auto w-full">
            {/* Header - Responsive */}
            <div className="mb-4 sm:mb-6">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                    Good day, {user?.name || "User"} 👋
                </h1>
                <p className="text-gray-500 text-xs sm:text-sm mt-1">
                    Here's your task overview for today
                </p>
            </div>

            {/* Loading State */}
            {loading ? (
                <div className="flex justify-center items-center h-40">
                    <p className="text-gray-500">Loading dashboard...</p>
                </div>
            ) : (
                <>
                    {/* Stats Cards - Responsive Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
                        {[
                            { label: "Total Tasks", value: dashboard?.totalTasks, color: "bg-indigo-500", icon: "📋" },
                            { label: "Pending", value: dashboard?.statusSummary?.pending, color: "bg-yellow-500", icon: "⏳" },
                            { label: "In Progress", value: dashboard?.statusSummary?.inProgress, color: "bg-blue-500", icon: "🔄" },
                            { label: "Completed", value: dashboard?.statusSummary?.completed, color: "bg-green-500", icon: "✅" },
                        ].map((stat) => (
                            <div 
                                key={stat.label} 
                                className={`${stat.color} text-white rounded-2xl p-3 sm:p-5 shadow-md transition-transform hover:scale-105`}
                            >
                                <p className="text-xl sm:text-2xl mb-0.5">{stat.icon}</p>
                                <p className="text-2xl sm:text-3xl font-bold">{stat.value ?? 0}</p>
                                <p className="text-xs sm:text-sm mt-0.5 opacity-90">{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Productivity Score Card - Fully Responsive */}
                    <div className="bg-white rounded-2xl shadow p-4 sm:p-6 mb-4 sm:mb-6">
                        <h2 className="text-base sm:text-lg font-bold text-gray-700 mb-3 sm:mb-4">
                            📊 Productivity Score
                        </h2>
                        
                        {/* Mobile: Stack vertically, Desktop: 3 columns */}
                        <div className="flex flex-col md:flex-row md:grid md:grid-cols-3 gap-4 sm:gap-6 items-center">
                            {/* Score - Full width on mobile */}
                            <div className="w-full text-center">
                                <p className={`text-5xl sm:text-6xl font-bold ${scoreColor}`}>
                                    {productivity.score}%
                                </p>
                                <p className="text-gray-500 text-xs sm:text-sm mt-1">{productivity.label}</p>
                                <div className="mt-2 sm:mt-3 w-full bg-gray-200 rounded-full h-2.5 sm:h-3">
                                    <div
                                        className={`${scoreBarColor} h-2.5 sm:h-3 rounded-full transition-all duration-700`}
                                        style={{ width: `${productivity.score}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Streak - Full width on mobile */}
                            <div className="w-full text-center">
                                <p className="text-4xl sm:text-6xl">🔥</p>
                                <p className="text-2xl sm:text-3xl font-bold text-orange-500 mt-0.5">
                                    {productivity.streak} Day{productivity.streak !== 1 ? "s" : ""}
                                </p>
                                <p className="text-gray-500 text-xs sm:text-sm mt-0.5">Current Streak</p>
                            </div>

                            {/* Breakdown - Full width on mobile */}
                            <div className="w-full space-y-1.5 sm:space-y-2">
                                <div className="flex justify-between text-xs sm:text-sm">
                                    <span className="text-gray-500">✅ Completed</span>
                                    <span className="font-semibold text-green-600">{dashboard?.statusSummary?.completed ?? 0} tasks</span>
                                </div>
                                <div className="flex justify-between text-xs sm:text-sm">
                                    <span className="text-gray-500">🔄 In Progress</span>
                                    <span className="font-semibold text-blue-600">{dashboard?.statusSummary?.inProgress ?? 0} tasks</span>
                                </div>
                                <div className="flex justify-between text-xs sm:text-sm">
                                    <span className="text-gray-500">⏳ Pending</span>
                                    <span className="font-semibold text-yellow-600">{dashboard?.statusSummary?.pending ?? 0} tasks</span>
                                </div>
                                <div className="flex justify-between text-xs sm:text-sm border-t pt-1.5 sm:pt-2">
                                    <span className="text-gray-500">📋 Total</span>
                                    <span className="font-semibold text-gray-700">{dashboard?.totalTasks ?? 0} tasks</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Two Column Section - Stack on Mobile */}
                    <div className="flex flex-col lg:flex-row lg:grid lg:grid-cols-2 gap-4 sm:gap-6">
                        {/* AI Goal Breakdown - Full width on mobile */}
                        <div className="bg-white rounded-2xl shadow p-4 sm:p-6 w-full">
                            <h2 className="text-base sm:text-lg font-bold text-gray-700 mb-1">
                                🤖 AI Goal Breakdown
                            </h2>
                            <p className="text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4">
                                Enter a goal and AI will break it into tasks
                            </p>
                            
                            {/* Input - Responsive */}
                            <div className="flex flex-col sm:flex-row gap-2">
                                <input
                                    type="text"
                                    placeholder="e.g. Learn Python in 2 weeks"
                                    className="flex-1 border border-gray-300 rounded-lg px-3 sm:px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 w-full"
                                    value={goal}
                                    onChange={(e) => setGoal(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleAISuggest()}
                                />
                                <button
                                    onClick={handleAISuggest}
                                    disabled={aiLoading}
                                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm w-full sm:w-auto"
                                >
                                    {aiLoading ? "..." : "Go"}
                                </button>
                            </div>

                            {/* AI Tasks List - Responsive */}
                            {aiTasks.length > 0 && (
                                <div className="mt-3 sm:mt-4 space-y-2 max-h-48 sm:max-h-64 overflow-y-auto">
                                    {aiTasks.map((task, index) => (
                                        <div 
                                            key={index} 
                                            className="border border-gray-100 rounded-lg p-2 sm:p-3 flex flex-wrap justify-between items-start bg-gray-50"
                                        >
                                            <div className="flex-1 min-w-[60%]">
                                                <p className="font-semibold text-gray-700 text-xs sm:text-sm">{task.title}</p>
                                                <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{task.description}</p>
                                                <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${
                                                    task.priority === 'high' ? 'bg-red-100 text-red-600' :
                                                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                                                    'bg-green-100 text-green-600'
                                                }`}>
                                                    {task.priority || "medium"}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => handleAddAITask(task)}
                                                className="bg-green-500 text-white px-3 py-1 rounded-lg text-xs hover:bg-green-600 ml-1 shrink-0 mt-1 sm:mt-0"
                                            >
                                                + Add
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Upcoming Tasks - Full width on mobile */}
                        <div className="bg-white rounded-2xl shadow p-4 sm:p-6 w-full">
                            <h2 className="text-base sm:text-lg font-bold text-gray-700 mb-1">
                                📅 Upcoming Tasks
                            </h2>
                            <p className="text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4">
                                Due in the next 7 days
                            </p>
                            {dashboard?.upcomingTasks?.length === 0 ? (
                                <p className="text-gray-400 text-sm">No upcoming tasks 🎉</p>
                            ) : (
                                <div className="space-y-2 max-h-48 sm:max-h-64 overflow-y-auto">
                                    {dashboard?.upcomingTasks?.slice(0, 5).map((task) => (
                                        <div
                                            key={task._id}
                                            onClick={() => navigate(`/tasks/${task._id}`)}
                                            className="flex flex-wrap sm:flex-nowrap justify-between items-center border border-gray-100 rounded-lg p-2 sm:p-3 cursor-pointer hover:bg-indigo-50 transition"
                                        >
                                            <div className="flex-1 min-w-[60%]">
                                                <p className="font-medium text-gray-700 text-xs sm:text-sm truncate">
                                                    {task.title}
                                                </p>
                                                <span className={`text-xs px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                                                    task.priority === 'high' ? 'bg-red-100 text-red-600' :
                                                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                                                    'bg-green-100 text-green-600'
                                                }`}>
                                                    {task.priority}
                                                </span>
                                            </div>
                                            <span className="text-xs text-gray-400 shrink-0 ml-2">
                                                {new Date(task.dueDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default UserDashboard;