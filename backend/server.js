require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require("socket.io");

const authRoute = require('./routes/auth');

const app = express();
const PORT = 3001;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoute);

const lobbies = {};

const createLobbyCode = () => {
  let code = '';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

io.on('connection', (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on('create_lobby', (username) => {
    let lobbyCode = createLobbyCode();
    while (lobbies[lobbyCode]) {
      lobbyCode = createLobbyCode();
    }
    socket.join(lobbyCode);
    lobbies[lobbyCode] = {
      players: [{ id: socket.id, username, ready: true }],
      host: socket.id
    };
    io.to(lobbyCode).emit('lobby_state', { lobbyCode, ...lobbies[lobbyCode] });
  });

  socket.on('join_lobby', ({ lobbyCode, username }) => {
    if (lobbies[lobbyCode] && lobbies[lobbyCode].players.length < 4) {
      socket.join(lobbyCode);
      lobbies[lobbyCode].players.push({ id: socket.id, username, ready: false });
      io.to(lobbyCode).emit('lobby_state', { lobbyCode, ...lobbies[lobbyCode] });
    } else {
      socket.emit('lobby_error', 'Lobby not found or is full.');
    }
  });

  socket.on('toggle_ready', (lobbyCode) => {
    if (lobbies[lobbyCode]) {
      const player = lobbies[lobbyCode].players.find(p => p.id === socket.id);
      if (player) {
        player.ready = !player.ready;
        io.to(lobbyCode).emit('lobby_state', { lobbyCode, ...lobbies[lobbyCode] });
      }
    }
  });

  socket.on('disconnect', () => {
    console.log(`User Disconnected: ${socket.id}`);
    for (const lobbyCode in lobbies) {
      const lobby = lobbies[lobbyCode];
      const playerIndex = lobby.players.findIndex(p => p.id === socket.id);
      
      if (playerIndex > -1) {
        lobby.players.splice(playerIndex, 1);
        if (lobby.players.length === 0) {
          delete lobbies[lobbyCode];
        } else {
          if (lobby.host === socket.id && lobby.players.length > 0) {
            lobby.host = lobby.players[0].id;
            lobby.players[0].ready = true;
          }
          io.to(lobbyCode).emit('lobby_state', { lobbyCode, ...lobby });
        }
        break;
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});