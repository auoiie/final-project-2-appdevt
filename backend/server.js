require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require("socket.io");
const User = require('./models/User');
const GameSession = require('./models/GameSession');
const Level = require('./models/Level');

const authRoute = require('./routes/auth');

const app = express();
const PORT = 3001;
const GAME_TICK_RATE = 1000 / 60;

const PLAYER_SPEED = 7;
const GRAVITY = 1.5;
const JUMP_FORCE = -22;
const TAG_COOLDOWN = 500;
const ROUND_TIME = 30;

const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 600;
const PLAYER_WIDTH = 40;
const PLAYER_HEIGHT = 40;
const PLAYER_COLORS = ['#58a9ffff', '#5bff84ff', '#f9d25eff', '#9f6ff9ff'];

const MAX_LOBBY_AGE = 3600 * 1000;
const LOBBY_CLEANUP_INTERVAL = 300 * 1000;

const server = http.createServer(app);

const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:5173";

const io = new Server(server, {
    cors: {
        origin: corsOrigin,
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

app.use(cors({ origin: corsOrigin }));
app.use(express.json());

app.use('/api/auth', authRoute);
app.use('/api/users', require('./routes/users'));
app.use('/api/games', require('./routes/games'));
app.use('/api/levels', require('./routes/levels'));

const lobbies = {};
const socketToLobby = {};

const createLobbyCode = () => {
    let code = '';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
};

const gameLoop = async (lobbyCode) => {
    const lobby = lobbies[lobbyCode];
    if (!lobby || !lobby.gameState || !lobby.gameActive) return;

    const gameState = lobby.gameState;

    const now = Date.now();
    if (now > lobby.nextSecond) {
        gameState.timer--;
        lobby.nextSecond = now + 1000;
    }
    
    if (gameState.timer <= 0) {
        const itPlayer = gameState.players.find(p => p.isIt);
        if (itPlayer) {
            itPlayer.disqualified = true;
            itPlayer.finishTimestamp = Date.now();
        }

        const activePlayers = gameState.players.filter(p => !p.disqualified);

        if (activePlayers.length <= 1) {
            if (lobby.gameOverHandled) return; 
            lobby.gameOverHandled = true; 

            const winner = activePlayers[0];
            const allPlayerUsernames = lobby.gameState.players.map(p => p.username);
    
            await User.updateMany({ username: { $in: allPlayerUsernames } }, { $inc: { gamesPlayed: 1 } });
            if (winner) {
                await User.findOneAndUpdate({ username: winner.username }, { $inc: { gamesWon: 1 } });
            }
            
            const disqualifiedPlayers = lobby.gameState.players
                .filter(p => p.disqualified)
                .sort((a, b) => b.finishTimestamp - a.finishTimestamp);

            const rankedPlayers = (winner ? [winner] : []).concat(disqualifiedPlayers);
            const userStats = await User.find({ username: { $in: allPlayerUsernames } }).select('username gamesPlayed gamesWon');
            const statsMap = new Map(userStats.map(stat => [stat.username, stat]));
            
            const rankedStats = rankedPlayers.map((player, index) => {
                const stat = statsMap.get(player.username);
                return {
                    rank: index + 1,
                    username: player.username,
                    gamesWon: stat?.gamesWon,
                    gamesPlayed: stat?.gamesPlayed,
                };
            });

            io.to(lobbyCode).emit('game_over', { winner: winner?.username, rankedStats });
    
            await GameSession.findOneAndUpdate(
                { lobbyCode: lobbyCode },
                { winner: winner?.username || "Draw", levelName: lobby.levelName || "Default" },
                { new: true }
            );

            clearInterval(lobby.intervalId);
            lobby.gameActive = false;
            return;
        } else {
            gameState.players.forEach(p => p.isIt = false);
            const randomIndex = Math.floor(Math.random() * activePlayers.length);
            const newItPlayer = activePlayers[randomIndex];
            newItPlayer.isIt = true;
            gameState.itPlayer = newItPlayer.username;
            gameState.timer = ROUND_TIME;
            lobby.nextSecond = Date.now() + 1000;
        }
    }
    
    gameState.players.forEach(player => {
        if (player.disqualified) return;
        if (player.inputs.a) player.velocity.x = -PLAYER_SPEED;
        else if (player.inputs.d) player.velocity.x = PLAYER_SPEED;
        else player.velocity.x = 0;
        if (player.inputs.w && player.onGround) {
            player.velocity.y = JUMP_FORCE;
            player.onGround = false;
        }
        player.velocity.y += GRAVITY;
        player.position.x += player.velocity.x;
        player.position.y += player.velocity.y;
        player.onGround = false;
        if (player.position.x < 0) player.position.x = 0;
        if (player.position.x > CANVAS_WIDTH - PLAYER_WIDTH) player.position.x = CANVAS_WIDTH - PLAYER_WIDTH;
        if (player.position.y < 0) {
            player.position.y = 0;
            player.velocity.y = 0;
        }
        gameState.platforms.forEach(platform => {
            const playerLeft = player.position.x;
            const playerRight = player.position.x + PLAYER_WIDTH;
            const playerTop = player.position.y;
            const playerBottom = player.position.y + PLAYER_HEIGHT;
            const platformLeft = platform.x;
            const platformRight = platform.x + platform.width;
            const platformTop = platform.y;
            const platformBottom = platform.y + platform.height;
            if (playerRight > platformLeft && playerLeft < platformRight && playerBottom > platformTop && playerTop < platformBottom) {
                const prevPlayerBottom = (player.position.y - player.velocity.y) + PLAYER_HEIGHT;
                const prevPlayerTop = player.position.y - player.velocity.y;
                if (player.velocity.y >= 0 && prevPlayerBottom <= platformTop) {
                    player.position.y = platformTop - PLAYER_HEIGHT;
                    player.velocity.y = 0;
                    player.onGround = true;
                } 
                else if (player.velocity.y < 0 && prevPlayerTop >= platformBottom) {
                    player.position.y = platformBottom;
                    player.velocity.y = 0;
                }
            }
        });
        if (player.position.y > CANVAS_HEIGHT - PLAYER_HEIGHT) {
            player.position.y = CANVAS_HEIGHT - PLAYER_HEIGHT;
            player.velocity.y = 0;
            player.onGround = true;
        }
    });

    const itPlayer = gameState.players.find(p => p.isIt);
    const otherPlayers = gameState.players.filter(p => !p.isIt && !p.disqualified);

    if (itPlayer && Date.now() > (lobby.lastTagTime || 0)) {
        for (const otherPlayer of otherPlayers) {
            const itLeft = itPlayer.position.x;
            const itRight = itPlayer.position.x + PLAYER_WIDTH;
            const itTop = itPlayer.position.y;
            const itBottom = itPlayer.position.y + PLAYER_HEIGHT;
            const otherLeft = otherPlayer.position.x;
            const otherRight = otherPlayer.position.x + PLAYER_WIDTH;
            const otherTop = otherPlayer.position.y;
            const otherBottom = otherPlayer.position.y + PLAYER_HEIGHT;
            if (itRight > otherLeft && itLeft < otherRight && itBottom > otherTop && itTop < otherBottom) {
                itPlayer.isIt = false;
                otherPlayer.isIt = true;
                gameState.itPlayer = otherPlayer.username;
                lobby.lastTagTime = Date.now() + TAG_COOLDOWN;
                break; 
            }
        }
    }
    io.to(lobbyCode).emit('game_state_update', gameState);
};

const handleLeaveOrDisconnect = (socketId) => {
    const lobbyInfo = socketToLobby[socketId];
    if (lobbyInfo) {
        const { lobbyCode, username } = lobbyInfo;
        const lobby = lobbies[lobbyCode];

        if (lobby) {
            if (lobby.intervalId) {
                clearInterval(lobby.intervalId);
            }
            if (lobby.gameActive || lobby.gameStarted) {
                const message = `${username} has disconnected. The game has ended.`;
                io.to(lobbyCode).emit('lobby_closed', message);
                delete lobbies[lobbyCode];
                console.log(`Lobby ${lobbyCode} closed due to player disconnect.`);
            } else {
                lobby.players = lobby.players.filter(p => p.id !== socketId);
                if (lobby.players.length === 0) {
                    delete lobbies[lobbyCode];
                    console.log(`Lobby ${lobbyCode} closed because it is empty.`);
                } else {
                    if (lobby.host === socketId) {
                        lobby.host = lobby.players[0].id;
                        lobby.players[0].ready = true;
                    }
                    io.to(lobbyCode).emit('lobby_state', { lobbyCode, ...lobby });
                }
            }
        }
    }
    delete socketToLobby[socketId];
}

io.on('connection', (socket) => {
    console.log(`User Connected: ${socket.id}`);

    socket.on('create_lobby', async (username) => {
        let lobbyCode = createLobbyCode();
        while (lobbies[lobbyCode]) {
            lobbyCode = createLobbyCode();
        }
        socket.join(lobbyCode);
        const playerInfo = { id: socket.id, username, ready: true, color: PLAYER_COLORS[0] };
        lobbies[lobbyCode] = {
            players: [playerInfo],
            host: socket.id,
            lastTagTime: 0,
            gameStarted: false,
            levelId: null,
            levelName: 'Default',
            createdAt: Date.now(),
        };
        socketToLobby[socket.id] = { lobbyCode, username };
        
        await GameSession.deleteMany({ lobbyCode });
        const newGameSession = new GameSession({
            lobbyCode,
            host: { username },
            players: [{ username, socketId: socket.id, color: playerInfo.color }]
        });
        await newGameSession.save();

        io.to(lobbyCode).emit('lobby_state', { lobbyCode, ...lobbies[lobbyCode] });
    });

    socket.on('join_lobby', async ({ lobbyCode, username }) => {
        const lobby = lobbies[lobbyCode];
        if (lobby && !lobby.gameStarted && lobby.players.length < 4) {
            socket.join(lobbyCode);
            const usedColors = lobby.players.map(p => p.color);
            const availableColor = PLAYER_COLORS.find(c => !usedColors.includes(c)) || PLAYER_COLORS[0];
            const newPlayer = { id: socket.id, username, ready: false, color: availableColor };
            lobby.players.push(newPlayer);
            socketToLobby[socket.id] = { lobbyCode, username };

            await GameSession.findOneAndUpdate(
                { lobbyCode },
                { $push: { players: { username, socketId: socket.id, color: newPlayer.color } } }
            );
            
            io.to(lobbyCode).emit('lobby_state', { lobbyCode, ...lobby });
        } else {
            socket.emit('lobby_error', 'Lobby not found, is full, or the game has already started.');
        }
    });

    socket.on('select_level', ({ lobbyCode, levelId, levelName }) => {
        const lobby = lobbies[lobbyCode];
        if (lobby && lobby.host === socket.id) {
            lobby.levelId = levelId;
            lobby.levelName = levelName;
            io.to(lobbyCode).emit('lobby_state', { lobbyCode, ...lobby });
        }
    });

    socket.on('select_color', ({ lobbyCode, color }) => {
        const lobby = lobbies[lobbyCode];
        if (lobby) {
            const player = lobby.players.find(p => p.id === socket.id);
            const usedColors = lobby.players.map(p => p.color).filter(c => c !== player.color);
            if (player && PLAYER_COLORS.includes(color) && !usedColors.includes(color)) {
                player.color = color;
                GameSession.updateOne(
                    { lobbyCode, "players.socketId": socket.id },
                    { $set: { "players.$.color": color } }
                ).catch(err => console.error("Error updating player color in DB:", err));
                io.to(lobbyCode).emit('lobby_state', { lobbyCode, ...lobby });
            }
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
    
    socket.on('send_chat_message', ({ lobbyCode, message }) => {
        const lobbyInfo = socketToLobby[socket.id];
        if (lobbyInfo && lobbyInfo.lobbyCode === lobbyCode) {
            const username = lobbyInfo.username;
            io.to(lobbyCode).emit('receive_chat_message', {
                username,
                text: message,
                id: `${socket.id}-${Date.now()}`
            });
        }
    });

    socket.on('start_game', async (lobbyCode) => {
        const lobby = lobbies[lobbyCode];
        if (lobby && lobby.host === socket.id) {
            const allReady = lobby.players.every(p => p.ready);
            if (allReady) {
                let levelData;
                if (lobby.levelId) {
                    levelData = await Level.findById(lobby.levelId);
                }

                const platforms = levelData ? levelData.platforms : [
                    { id: 'floor', x: 0, y: 560, width: 1200, height: 40 },
                    { id: 'p1', x: 400, y: 420, width: 400, height: 30 },
                    { id: 'p2', x: 100, y: 280, width: 250, height: 30 },
                    { id: 'p3', x: 850, y: 280, width: 250, height: 30 },
                    { id: 'p4', x: 475, y: 140, width: 250, height: 30 },
                ];
                
                const spawnPoints = levelData ? levelData.spawnPoints : [
                    { x: 150, y: 520 }, { x: 1000, y: 520 },
                    { x: 580, y: 380 }, { x: 150, y: 240 },
                ];

                lobby.gameStarted = true;
                lobby.gameActive = false;
                lobby.gameOverHandled = false;
                
                const randomIndex = Math.floor(Math.random() * lobby.players.length);
                const itPlayerId = lobby.players[randomIndex].id;
                
                const initialGameState = {
                    lobbyCode: lobbyCode,
                    hostId: lobby.host,
                    players: lobby.players.map((p, index) => ({
                        id: p.id, username: p.username, isIt: p.id === itPlayerId, color: p.color,
                        position: spawnPoints[index % spawnPoints.length],
                        velocity: { x: 0, y: 0 }, inputs: { a: false, d: false, w: false },
                        onGround: true, disqualified: false,
                    })),
                    platforms: platforms,
                    timer: ROUND_TIME, itPlayer: lobby.players[randomIndex].username
                };
                
                lobby.gameState = initialGameState;
                io.to(lobbyCode).emit('game_started', initialGameState);

                let countdown = 3;
                const countdownInterval = setInterval(() => {
                    io.to(lobbyCode).emit('countdown', countdown);
                    countdown--;
                    if (countdown < 0) {
                        clearInterval(countdownInterval);
                        lobby.nextSecond = Date.now() + 1000;
                        lobby.gameActive = true;
                        const intervalId = setInterval(() => gameLoop(lobbyCode), GAME_TICK_RATE);
                        lobby.intervalId = intervalId;
                    }
                }, 1000);
            }
        }
    });
    
    socket.on('player_input', ({ lobbyCode, key, state }) => {
        const lobby = lobbies[lobbyCode];
        if (lobby && lobby.gameState && lobby.gameActive) {
            const player = lobby.gameState.players.find(p => p.id === socket.id);
            if (player && player.inputs.hasOwnProperty(key)) {
                player.inputs[key] = state;
            }
        }
    });

    socket.on('leave_game', () => {
        handleLeaveOrDisconnect(socket.id);
    });

    socket.on('disconnect', () => {
        handleLeaveOrDisconnect(socket.id);
    });
});

setInterval(() => {
    const now = Date.now();
    for (const lobbyCode in lobbies) {
        const lobby = lobbies[lobbyCode];
        if (!lobby.gameActive && (now - lobby.createdAt > MAX_LOBBY_AGE)) {
            delete lobbies[lobbyCode];
            GameSession.findOneAndDelete({ lobbyCode }).catch(err => console.error(err));
            console.log(`Cleaned up inactive lobby ${lobbyCode}`);
        }
    }
}, LOBBY_CLEANUP_INTERVAL);

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});