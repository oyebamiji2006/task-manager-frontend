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

        // Score: completed tasks weighted higher
        let score = 0;
        if (total > 0) {
            score = Math.round(
                ((completed * 1.0 + inProgress * 0.5) / total) * 100
            );
        }

        // Streak: based on completed vs total (simulate streak)
        let streak = 0;
        if (score >= 80) streak = Math.min(7, completed);
        else if (score >= 50) streak = Math.min(4, completed);
        else if (score >= 20) streak = Math.min(2, completed);
        else streak = 0;

        // Label
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
            setAiTasks(data.tasks);
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
                    priority: task.priority,
                    dueDate: task.dueDate,
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
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Good day, {user?.name} 👋</h1>
                <p className="text-gray-500 text-sm mt-1">Here's your task overview for today</p>
            </div>

            {/* Stats */}
            {loading ? (
                <p className="text-gray-500">Loading dashboard...</p>
            ) : (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        {[
                            { label: "Total Tasks", value: dashboard?.totalTasks, color: "bg-indigo-500", icon: "📋" },
                            { label: "Pending", value: dashboard?.statusSummary?.pending, color: "bg-yellow-500", icon: "⏳" },
                            { label: "In Progress", value: dashboard?.statusSummary?.inProgress, color: "bg-blue-500", icon: "🔄" },
                            { label: "Completed", value: dashboard?.statusSummary?.completed, color: "bg-green-500", icon: "✅" },
                        ].map((stat) => (
                            <div key={stat.label} className={`${stat.color} text-white rounded-2xl p-5 shadow-md`}>
                                <p className="text-2xl mb-1">{stat.icon}</p>
                                <p className="text-3xl font-bold">{stat.value ?? 0}</p>
                                <p className="text-sm mt-1 opacity-90">{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Productivity Score + Streak Card */}
                    <div className="bg-white rounded-2xl shadow p-6 mb-6">
                        <h2 className="text-lg font-bold text-gray-700 mb-4">📊 Productivity Score</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                            {/* Score */}
                            <div className="text-center">
                                <p className={`text-6xl font-bold ${scoreColor}`}>
                                    {productivity.score}%
                                </p>
                                <p className="text-gray-500 text-sm mt-2">{productivity.label}</p>
                                <div className="mt-3 w-full bg-gray-200 rounded-full h-3">
                                    <div
                                        className={`${scoreBarColor} h-3 rounded-full transition-all duration-700`}
                                        style={{ width: `${productivity.score}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Streak */}
                            <div className="text-center">
                                <p className="text-6xl">🔥</p>
                                <p className="text-3xl font-bold text-orange-500 mt-1">
                                    {productivity.streak} Day{productivity.streak !== 1 ? "s" : ""}
                                </p>
                                <p className="text-gray-500 text-sm mt-1">Current Streak</p>
                            </div>

                            {/* Breakdown */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">✅ Completed</span>
                                    <span className="font-semibold text-green-600">{dashboard?.statusSummary?.completed ?? 0} tasks</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">🔄 In Progress</span>
                                    <span className="font-semibold text-blue-600">{dashboard?.statusSummary?.inProgress ?? 0} tasks</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">⏳ Pending</span>
                                    <span className="font-semibold text-yellow-600">{dashboard?.statusSummary?.pending ?? 0} tasks</span>
                                </div>
                                <div className="flex justify-between text-sm border-t pt-2">
                                    <span className="text-gray-500">📋 Total</span>
                                    <span className="font-semibold text-gray-700">{dashboard?.totalTasks ?? 0} tasks</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* AI Goal Breakdown */}
                <div className="bg-white rounded-2xl shadow p-6">
                    <h2 className="text-lg font-bold text-gray-700 mb-1">🤖 AI Goal Breakdown</h2>
                    <p className="text-sm text-gray-400 mb-4">Enter a goal and AI will break it into tasks</p>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="e.g. Learn Python in 2 weeks"
                            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            value={goal}
                            onChange={(e) => setGoal(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleAISuggest()}
                        />
                        <button
                            onClick={handleAISuggest}
                            disabled={aiLoading}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm"
                        >
                            {aiLoading ? "..." : "Go"}
                        </button>
                    </div>

                    {aiTasks.length > 0 && (
                        <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
                            {aiTasks.map((task, index) => (
                                <div key={index} className="border border-gray-100 rounded-lg p-3 flex justify-between items-start bg-gray-50">
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-700 text-sm">{task.title}</p>
                                        <p className="text-xs text-gray-400 mt-1">{task.description}</p>
                                        <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${
                                            task.priority === 'high' ? 'bg-red-100 text-red-600' :
                                            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                                            'bg-green-100 text-green-600'
                                        }`}>
                                            {task.priority}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => handleAddAITask(task)}
                                        className="bg-green-500 text-white px-3 py-1 rounded-lg text-xs hover:bg-green-600 ml-2 shrink-0"
                                    >
                                        + Add
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Upcoming Tasks */}
                <div className="bg-white rounded-2xl shadow p-6">
                    <h2 className="text-lg font-bold text-gray-700 mb-1">📅 Upcoming Tasks</h2>
                    <p className="text-sm text-gray-400 mb-4">Due in the next 7 days</p>
                    {dashboard?.upcomingTasks?.length === 0 ? (
                        <p className="text-gray-400 text-sm">No upcoming tasks 🎉</p>
                    ) : (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {dashboard?.upcomingTasks?.map((task) => (
                                <div
                                    key={task._id}
                                    onClick={() => navigate(`/tasks/${task._id}`)}
                                    className="flex justify-between items-center border border-gray-100 rounded-lg p-3 cursor-pointer hover:bg-indigo-50 transition"
                                >
                                    <div>
                                        <p className="font-medium text-gray-700 text-sm">{task.title}</p>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                                            task.priority === 'high' ? 'bg-red-100 text-red-600' :
                                            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                                            'bg-green-100 text-green-600'
                                        }`}>{task.priority}</span>
                                    </div>
                                    <span className="text-xs text-gray-400">
                                        {new Date(task.dueDate).toLocaleDateString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;