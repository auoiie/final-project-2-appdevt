import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import App from './App.jsx'
import './index.css'

import Login from './pages/Login.jsx';
import Lobby from './pages/Lobby.jsx';
import GameArena from './pages/GameArena.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

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
            path: "/",
            element: <Navigate to="/lobby" />,
          }
        ]
      },
    ]
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)