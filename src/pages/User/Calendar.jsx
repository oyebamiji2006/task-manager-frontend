import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

const Calendar = () => {
    const navigate = useNavigate();
    const [tasks, setTasks] = useState([]);
    const [today] = useState(new Date());
    const [current, setCurrent] = useState(new Date());
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch("https://task-manager-backend-fdic.onrender.com/api/tasks", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                setTasks(data.tasks || []);
            } catch (err) {
                console.error(err);
            }
        };
        fetchTasks();
    }, []);

    const year = current.getFullYear();
    const month = current.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const getTasksForDay = (day) => {
        return tasks.filter(task => {
            if (!task.dueDate) return false;
            const d = new Date(task.dueDate);
            return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
        });
    };

    const selectedTasks = selected ? getTasksForDay(selected) : [];

    const priorityColor = (p) =>
        p === "high" ? "bg-red-400" :
        p === "medium" ? "bg-yellow-400" : "bg-green-400";

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">📅 Calendar</h1>
                <p className="text-gray-500 text-sm mt-1">View your tasks by date</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-white rounded-2xl shadow p-6">
                    <div className="flex justify-between items-center mb-4">
                        <button onClick={() => setCurrent(new Date(year, month - 1))} className="text-indigo-600 hover:bg-indigo-50 px-3 py-1 rounded-lg">←</button>
                        <h2 className="text-lg font-bold text-gray-700">{MONTHS[month]} {year}</h2>
                        <button onClick={() => setCurrent(new Date(year, month + 1))} className="text-indigo-600 hover:bg-indigo-50 px-3 py-1 rounded-lg">→</button>
                    </div>

                    <div className="grid grid-cols-7 mb-2">
                        {DAYS.map(d => (
                            <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                        {Array(firstDay).fill(null).map((_, i) => <div key={`empty-${i}`} />)}
                        {Array(daysInMonth).fill(null).map((_, i) => {
                            const day = i + 1;
                            const dayTasks = getTasksForDay(day);
                            const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
                            const isSelected = selected === day;

                            return (
                                <div
                                    key={day}
                                    onClick={() => setSelected(day === selected ? null : day)}
                                    className={`relative p-1 rounded-lg cursor-pointer min-h-[48px] flex flex-col items-center transition ${
                                        isSelected ? "bg-indigo-100 ring-2 ring-indigo-400" :
                                        isToday ? "bg-indigo-50" : "hover:bg-gray-50"
                                    }`}
                                >
                                    <span className={`text-sm font-medium ${isToday ? "text-indigo-600 font-bold" : "text-gray-700"}`}>
                                        {day}
                                    </span>
                                    <div className="flex flex-wrap gap-0.5 mt-1 justify-center">
                                        {dayTasks.slice(0, 3).map((task, idx) => (
                                            <span key={idx} className={`w-2 h-2 rounded-full ${priorityColor(task.priority)}`} />
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow p-6">
                    <h3 className="font-bold text-gray-700 mb-4">
                        {selected ? `Tasks for ${MONTHS[month]} ${selected}` : "Select a day"}
                    </h3>
                    {selected && selectedTasks.length === 0 && (
                        <p className="text-gray-400 text-sm">No tasks due this day 🎉</p>
                    )}
                    <div className="space-y-2">
                        {selectedTasks.map(task => (
                            <div key={task._id} onClick={() => navigate(`/tasks/${task._id}`)} className="border border-gray-100 rounded-lg p-3 cursor-pointer hover:bg-indigo-50 transition">
                                <p className="font-medium text-gray-700 text-sm">{task.title}</p>
                                <div className="flex gap-2 mt-1">
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                                        task.priority === 'high' ? 'bg-red-100 text-red-600' :
                                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                                        'bg-green-100 text-green-600'
                                    }`}>{task.priority}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                                        task.status === 'completed' ? 'bg-green-100 text-green-600' :
                                        task.status === 'in-progress' ? 'bg-blue-100 text-blue-600' :
                                        'bg-gray-100 text-gray-600'
                                    }`}>{task.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Calendar;