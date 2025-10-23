import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from './App.jsx'
import './index.css'

// Import our new pages
import Login from './pages/Login.jsx';
import Lobby from './pages/Lobby.jsx';
import GameArena from './pages/GameArena.jsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    // Add the children routes
    children: [
      {
        path: "/login", // This will be the page at http://localhost:5173/login
        element: <Login />,
      },
      {
        path: "/lobby", // This will be the page at http://localhost:5173/lobby
        element: <Lobby />,
      },
      {
        path: "/game", // This will be the page at http://localhost:5173/game
        element: <GameArena />,
      },
    ]
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)