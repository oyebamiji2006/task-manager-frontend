import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Layout = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const navItems = [
        { label: "Dashboard", path: "/dashboard", icon: "🏠" },
        { label: "My Tasks", path: "/tasks", icon: "✅" },
        { label: "Calendar", path: "/calendar", icon: "📅" },
        { label: "AI Assistant", path: "/ai-chat", icon: "🤖" },
    ];

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <div className={`${collapsed ? "w-16" : "w-64"} bg-indigo-900 text-white flex flex-col transition-all duration-300`}>
                {/* Logo */}
                <div className="flex items-center justify-between p-4 border-b border-indigo-700">
                    {!collapsed && <h1 className="text-lg font-bold">TaskFlow AI</h1>}
                    <button onClick={() => setCollapsed(!collapsed)} className="text-indigo-300 hover:text-white text-xl">
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
            <div className="flex-1 overflow-auto">
                {children}
            </div>
        </div>
    );
};

export default Layout;