import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const ViewTaskDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({});

    const token = localStorage.getItem("token");

    const fetchTask = async () => {
        try {
            const res = await fetch(`https://task-manager-backend-fdic.onrender.com/api/tasks/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setTask(data);
            setForm({
                title: data.title,
                description: data.description || "",
                priority: data.priority,
                status: data.status,
                dueDate: data.dueDate ? data.dueDate.split("T")[0] : "",
                category: data.category || "",
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTask();
    }, [id]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await fetch(`https://task-manager-backend-fdic.onrender.com/api/tasks/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(form),
            });
            setEditing(false);
            fetchTask();
        } catch (err) {
            console.error(err);
        }
    };

    const handleChecklistToggle = async (index) => {
        const updated = task.todoChecklist.map((item, i) =>
            i === index ? { ...item, completed: !item.completed } : item
        );
        try {
            await fetch(`https://task-manager-backend-fdic.onrender.com/api/tasks/${id}/todo`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ todoChecklist: updated }),
            });
            fetchTask();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Delete this task?")) return;
        try {
            await fetch(`https://task-manager-backend-fdic.onrender.com/api/tasks/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            navigate("/tasks");
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

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!task) return <div className="min-h-screen flex items-center justify-center">Task not found</div>;

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <button onClick={() => navigate("/tasks")} className="text-indigo-600 hover:underline">
                        ← Back to Tasks
                    </button>
                    <div className="flex gap-2">
                        <button onClick={() => setEditing(!editing)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm">
                            {editing ? "Cancel" : "Edit"}
                        </button>
                        <button onClick={handleDelete} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 text-sm">
                            Delete
                        </button>
                    </div>
                </div>

                {/* Edit Form */}
                {editing ? (
                    <div className="bg-white rounded-2xl shadow p-6 mb-6">
                        <h2 className="text-lg font-bold text-gray-700 mb-4">Edit Task</h2>
                        <form onSubmit={handleUpdate} className="space-y-3">
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                required
                            />
                            <textarea
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                placeholder="Description"
                            />
                            <div className="grid grid-cols-2 gap-3">
                                <select
                                    className="border border-gray-300 rounded-lg px-4 py-2"
                                    value={form.priority}
                                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                                <select
                                    className="border border-gray-300 rounded-lg px-4 py-2"
                                    value={form.status}
                                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="in-progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    type="date"
                                    className="border border-gray-300 rounded-lg px-4 py-2"
                                    value={form.dueDate}
                                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                                />
                                <input
                                    type="text"
                                    placeholder="Category"
                                    className="border border-gray-300 rounded-lg px-4 py-2"
                                    value={form.category}
                                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                                />
                            </div>
                            <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700">
                                Save Changes
                            </button>
                        </form>
                    </div>
                ) : (
                    /* Task Details */
                    <div className="bg-white rounded-2xl shadow p-6 mb-6">
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">{task.title}</h1>
                        {task.description && <p className="text-gray-500 mb-4">{task.description}</p>}
                        <div className="flex gap-2 flex-wrap mb-4">
                            <span className={`text-xs px-3 py-1 rounded-full ${priorityColor(task.priority)}`}>{task.priority} priority</span>
                            <span className={`text-xs px-3 py-1 rounded-full ${statusColor(task.status)}`}>{task.status}</span>
                            {task.category && <span className="text-xs px-3 py-1 rounded-full bg-purple-100 text-purple-600">{task.category}</span>}
                            {task.dueDate && <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-500">Due: {new Date(task.dueDate).toLocaleDateString()}</span>}
                        </div>

                        {/* Progress Bar */}
                        {task.todoChecklist?.length > 0 && (
                            <div className="mb-4">
                                <div className="flex justify-between text-sm text-gray-500 mb-1">
                                    <span>Progress</span>
                                    <span>{task.progress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-indigo-500 h-2 rounded-full transition-all" style={{ width: `${task.progress}%` }}></div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Checklist */}
                {task.todoChecklist?.length > 0 && (
                    <div className="bg-white rounded-2xl shadow p-6">
                        <h2 className="text-lg font-bold text-gray-700 mb-4">Checklist</h2>
                        <div className="space-y-2">
                            {task.todoChecklist.map((item, index) => (
                                <div
                                    key={index}
                                    onClick={() => handleChecklistToggle(index)}
                                    className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-gray-50"
                                >
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${item.completed ? "bg-indigo-600 border-indigo-600" : "border-gray-300"}`}>
                                        {item.completed && <span className="text-white text-xs">✓</span>}
                                    </div>
                                    <span className={`text-gray-700 ${item.completed ? "line-through text-gray-400" : ""}`}>
                                        {item.text}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ViewTaskDetails;