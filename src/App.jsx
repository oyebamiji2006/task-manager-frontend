import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from "./pages/Auth/Login";
import Signup from './pages/Auth/Signup';
import Dashboard from './pages/User/UserDashboard';
import MyTasks from './pages/User/MyTasks';
import ViewTaskDetails from './pages/User/ViewTaskDetails';
import Calendar from './pages/User/Calendar';
import AIChat from './pages/User/AIChat';
import Layout from './components/Layout';
import { useAuth } from './context/AuthContext';

const PrivateRoute = ({ children }) => {
    const { user } = useAuth();
    return user ? <Layout>{children}</Layout> : <Navigate to="/login" />;
};

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                <Route path="/tasks" element={<PrivateRoute><MyTasks /></PrivateRoute>} />
                <Route path="/tasks/:id" element={<PrivateRoute><ViewTaskDetails /></PrivateRoute>} />
                <Route path="/calendar" element={<PrivateRoute><Calendar /></PrivateRoute>} />
                <Route path="/ai-chat" element={<PrivateRoute><AIChat /></PrivateRoute>} />
            </Routes>
        </Router>
    );
};

export default App;