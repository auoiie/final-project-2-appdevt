import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import App from './App.jsx'
import './index.css'

import Login from './pages/Login.jsx';
import Lobby from './pages/Lobby.jsx';
import GameArena from './pages/GameArena.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminRoute from './components/AdminRoute.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import Profile from './pages/Profile.jsx';
import GameHistory from './pages/GameHistory.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import LevelManagement from './pages/LevelManagement.jsx';
import UserManagement from './pages/UserManagement.jsx';

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            {
                path: "/login",
                element: <Login />,
            },
            {
                path: "/forgot-password",
                element: <ForgotPassword />,
            },
            {
                element: <ProtectedRoute />,
                children: [
                    {
                        path: "/lobby",
                        element: <Lobby />,
                    },
                    {
                        path: "/game/:lobbyCode",
                        element: <GameArena />,
                    },
                    {
                        path: "/profile",
                        element: <Profile />,
                    },
                    {
                        path: "/history",
                        element: <GameHistory />,
                    },
                    {
                        path: "/",
                        element: <Navigate to="/lobby" />,
                    }
                ]
            },
            {
                element: <AdminRoute />,
                children: [
                    {
                        path: "/admin",
                        element: <AdminDashboard />,
                    },
                    {
                        path: "/admin/levels",
                        element: <LevelManagement />,
                    },
                    {
                        path: "/admin/users",
                        element: <UserManagement />,
                    }
                ]
            }
        ]
    },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>,
)