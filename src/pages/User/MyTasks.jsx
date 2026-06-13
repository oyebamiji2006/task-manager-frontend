import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const MyTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [statusSummary, setStatusSummary] = useState({});
    const [filter, setFilter] = useState("all");
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [newTask, setNewTask] = useState({ title: "", description: "", priority: "medium", dueDate: "", category: "" });
    const navigate = useNavigate();

    const fetchTasks = async (status) => {
        try {
            const token = localStorage.getItem("token");
            const url = status && status !== "all"
                ? `https://task-manager-backend-fdic.onrender.com/api/tasks?status=${status}`
                : "https://task-manager-backend-fdic.onrender.com/api/tasks";
            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setTasks(data.tasks);
            setStatusSummary(data.statusSummary);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks(filter);
    }, [filter]);

    const handleCreateTask = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            await fetch("https://task-manager-backend-fdic.onrender.com/api/tasks", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(newTask),
            });
            setNewTask({ title: "", description: "", priority: "medium", dueDate: "", category: "" });
            setShowForm(false);
            fetchTasks(filter);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this task?")) return;
        try {
            const token = localStorage.getItem("token");
            await fetch(`https://task-manager-backend-fdic.onrender.com/api/tasks/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchTasks(filter);
        } catch (err) {
            console.error(err);
        }
    };

    const priorityColor = (p) =>
        p === "high" ? "bg-red-100 text-red-600" :
        p === "medium" ? "bg-yellow-100 text-yellow-600" :
        "bg-green-100 text-green-600";

    const statusColor = (s) =>
        s === "completed" ? "bg-green-100 text-green-600" :
        s === "in-progress" ? "bg-blue-100 text-blue-600" :
        "bg-gray-100 text-gray-600";

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-indigo-600">My Tasks</h1>
                <div className="flex gap-3">
                    <button onClick={() => navigate("/dashboard")} className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600">
                        Dashboard
                    </button>
                    <button onClick={() => setShowForm(!showForm)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
                        + New Task
                    </button>
                </div>
            </div>

            {/* Create Task Form */}
            {showForm && (
                <div className="bg-white rounded-2xl shadow p-6 mb-6">
                    <h2 className="text-lg font-bold text-gray-700 mb-4">Create New Task</h2>
                    <form onSubmit={handleCreateTask} className="space-y-3">
                        <input
                            type="text"
                            placeholder="Task title"
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            value={newTask.title}
                            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                            required
                        />
                        <textarea
                            placeholder="Description (optional)"
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            value={newTask.description}
                            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                        />
                        <div className="grid grid-cols-2 gap-3">
                            <select
                                className="border border-gray-300 rounded-lg px-4 py-2"
                                value={newTask.priority}
                                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                            >
                                <option value="low">Low Priority</option>
                                <option value="medium">Medium Priority</option>
                                <option value="high">High Priority</option>
                            </select>
                            <input
                                type="date"
                                className="border border-gray-300 rounded-lg px-4 py-2"
                                value={newTask.dueDate}
                                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                            />
                        </div>
                        <input
                            type="text"
                            placeholder="Category (e.g. Work, Personal)"
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            value={newTask.category}
                            onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                        />
                        <div className="flex gap-3">
                            <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700">
                                Create
                            </button>
                            <button type="button" onClick={() => setShowForm(false)} className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-4 flex-wrap">
                {["all", "pending", "in-progress", "completed"].map((s) => (
                    <button
                        key={s}
                        onClick={() => setFilter(s)}
                        className={`px-4 py-2 rounded-full text-sm font-medium capitalize ${filter === s ? "bg-indigo-600 text-white" : "bg-white text-gray-600 border border-gray-300"}`}
                    >
                        {s} {s === "all" ? `(${statusSummary.all ?? 0})` : s === "pending" ? `(${statusSummary.pending ?? 0})` : s === "in-progress" ? `(${statusSummary.inProgress ?? 0})` : `(${statusSummary.completed ?? 0})`}
                    </button>
                ))}
            </div>

            {/* Task List */}
            {loading ? (
                <p className="text-gray-500">Loading tasks...</p>
            ) : tasks.length === 0 ? (
                <p className="text-gray-400 text-center mt-10">No tasks found. Create one! 🎯</p>
            ) : (
                <div className="space-y-3">
                    {tasks.map((task) => (
                        <div key={task._id} className="bg-white rounded-xl shadow p-4 flex justify-between items-start">
                            <div className="flex-1 cursor-pointer" onClick={() => navigate(`/tasks/${task._id}`)}>
                                <p className="font-semibold text-gray-800">{task.title}</p>
                                {task.description && <p className="text-sm text-gray-500 mt-1">{task.description}</p>}
                                <div className="flex gap-2 mt-2 flex-wrap">
                                    <span className={`text-xs px-2 py-1 rounded-full ${priorityColor(task.priority)}`}>{task.priority}</span>
                                    <span className={`text-xs px-2 py-1 rounded-full ${statusColor(task.status)}`}>{task.status}</span>
                                    {task.category && <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-600">{task.category}</span>}
                                    {task.dueDate && <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-500">Due: {new Date(task.dueDate).toLocaleDateString()}</span>}
                                </div>
                                {task.progress > 0 && (
                                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                                        <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${task.progress}%` }}></div>
                                    </div>
                                )}
                            </div>
                            <button onClick={() => handleDelete(task._id)} className="text-red-400 hover:text-red-600 ml-4 text-sm">
                                Delete
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyTasks;