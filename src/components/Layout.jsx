import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  requestNotificationPermission,
  checkTaskAlerts,
} from "../utils/notifications";

const AlertBanner = ({ alerts, onDismiss }) => {
  if (!alerts || alerts.length === 0) return null;
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-80">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`p-4 rounded-lg shadow-lg text-white flex items-start justify-between gap-2 ${
            alert.type === "overdue" ? "bg-red-600" : "bg-yellow-500"
          }`}
        >
          <div>
            <p className="font-semibold text-sm">
              {alert.type === "overdue" ? "🚨 Overdue Task" : "⏰ Due Soon"}
            </p>
            <p className="text-sm mt-1">{alert.message}</p>
          </div>
          <button
            onClick={() => onDismiss(alert.id)}
            className="text-white text-xl leading-none ml-2 font-bold"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const alertedTasksRef = useRef(new Set());

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const dismissAlert = (id) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  // Request notification permission on mount
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  // Poll tasks every 60 seconds and check for alerts
  useEffect(() => {
    if (!user) return;

    const fetchAndCheck = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          "https://task-manager-backend-fdic.onrender.com/api/tasks",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        const tasks = data.tasks || data || [];

        checkTaskAlerts(tasks, alertedTasksRef, (alert) => {
          setAlerts((prev) => [
            ...prev,
            { ...alert, id: Date.now() + Math.random() },
          ]);
          // Auto-dismiss after 10 seconds
          setTimeout(() => {
            setAlerts((prev) =>
              prev.filter((a) => a.message !== alert.message)
            );
          }, 10000);
        });
      } catch (err) {
        console.error("Notification check failed:", err);
      }
    };

    fetchAndCheck(); // Run immediately on login
    const interval = setInterval(fetchAndCheck, 60000); // Then every 60s
    return () => clearInterval(interval);
  }, [user]);

  const navItems = [
    { label: "Dashboard", path: "/dashboard", icon: "🏠" },
    { label: "My Tasks", path: "/tasks", icon: "✅" },
    { label: "Calendar", path: "/calendar", icon: "📅" },
    { label: "AI Assistant", path: "/ai-chat", icon: "🤖" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Alert Banners */}
      <AlertBanner alerts={alerts} onDismiss={dismissAlert} />

      {/* Sidebar */}
      <div
        className={`${
          collapsed ? "w-16" : "w-64"
        } bg-indigo-900 text-white flex flex-col transition-all duration-300`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-indigo-700">
          {!collapsed && <h1 className="text-lg font-bold">TaskFlow AI</h1>}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-indigo-300 hover:text-white text-xl"
          >
            {collapsed ? "→" : "←"}
          </button>
        </div>

        {/* User Info */}
        {!collapsed && (
          <div className="p-4 border-b border-indigo-700">
            <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-lg mb-2">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <p className="font-semibold text-sm">{user?.name}</p>
            <p className="text-indigo-300 text-xs">{user?.email}</p>
          </div>
        )}

        {/* Nav Items */}
        <nav className="flex-1 p-2 space-y-1 mt-2">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === item.path
                  ? "bg-indigo-600 text-white"
                  : "text-indigo-200 hover:bg-indigo-700 hover:text-white"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-2 border-t border-indigo-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-indigo-200 hover:bg-red-600 hover:text-white transition-colors"
          >
            <span className="text-lg">🚪</span>
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
};

export default Layout;